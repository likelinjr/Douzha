import OpenAI from "openai"
import type { ChatCompletionChunk } from 'openai/resources/chat/completions'
import { Message } from '../../types/message.js'
import { ToolCall } from '../../types/tool.js'
import { ToolDefinition } from "../../types/tool.js"
import { ModelConfig } from "../../types/modelConfig.js"
import { eventType } from "../../types/events.js"

export async function* OpenAIThink(
  modelConfig: ModelConfig,
  messages: Message[], 
  toolsDefinitions: ToolDefinition[], 
  systemPrompt: string, 
): AsyncIterableIterator<eventType> {
  const client = new OpenAI({
    baseURL: modelConfig.baseURL || undefined,
    apiKey: modelConfig.apiKey,
  })
  try {
    const stream = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: modelConfig.modelName, 
      tools: toolsDefinitions.length > 0 ? toolsDefinitions : undefined,
      tool_choice: toolsDefinitions.length > 0 ? "auto" : undefined,
      stream: true,
      stream_options: { include_usage: true }
    })
    let toolCalls: ToolCall[] = []
    let finishReason: string = ""
    let usageStats: ChatCompletionChunk['usage'] | null = null

    for await (const chunk of stream) {
      if (chunk.usage) {
        usageStats = chunk.usage
      }
      if (!chunk.choices || chunk.choices.length === 0) {
        continue 
      }
      const choice = chunk.choices[0]
      const delta = choice.delta as ChatCompletionChunk.Choice.Delta & { reasoning_content?: string }
      if (choice.finish_reason) {
        finishReason = choice.finish_reason
      }
      if (delta.reasoning_content) {
        const rc = delta.reasoning_content
        rc.trim() && ( yield { type: 'thinking', chunk: rc } )
      }
      if (delta.content) {
        delta.content.trim() && ( yield { type: 'content', chunk: delta.content } )
      }
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const index = tc.index
          if (!toolCalls[index]) {
            toolCalls[index] = {
              id: "",
              type: "function",
              function: { name: "", arguments: "" }
            }
          }
          if (tc.id) toolCalls[index].id = tc.id
          if (tc.function?.name) toolCalls[index].function.name += tc.function.name
          if (tc.function?.arguments) toolCalls[index].function.arguments += tc.function.arguments

          // 流式输出工具调用增量
          yield {
            type: 'tool_call_delta',
            index,
            id: tc.id || undefined,
            name: tc.function?.name || undefined,
            arguments: tc.function?.arguments || undefined,
          }
        }
      }
    }
    yield { type: "tool_calls", calls: toolCalls }

    // 输出缓存命中率统计
    if (usageStats) {
      const promptTokens = usageStats.prompt_tokens || 0
      const cachedTokens = usageStats.prompt_tokens_details?.cached_tokens || 0
      const cacheHitRate = promptTokens > 0 ? (cachedTokens / promptTokens * 100).toFixed(1) : '0.0'
      yield { type: "usage", metrics: `📊 Token 统计: 总数 ${promptTokens} | 缓存命中 ${cachedTokens} | 命中率 ${cacheHitRate}%` }
    }

    if (finishReason && !['stop', 'tool_calls'].includes(finishReason)) {
      const warningMsg = `⚠️ 当前输出被强制中断，原因: ${finishReason}`
      yield { type: "warn", message: warningMsg.trim() }
    }
    
    yield { type: "done" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    yield { type: "error", message: `${modelConfig.serviceProvider} 连接失败: ${message}` }
  }
}
