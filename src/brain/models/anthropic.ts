import Anthropic from "@anthropic-ai/sdk"
import type {
  RawMessageStreamEvent,
  MessageParam,
  ContentBlockParam,
  Tool,
  ToolResultBlockParam,
} from "@anthropic-ai/sdk/resources/messages/messages.js"
import { Message } from '../../types/message.js'
import { ToolCall } from '../../types/tool.js'
import { ToolDefinition } from "../../types/tool.js"
import { ModelConfig } from "../../types/modelConfig.js"
import { eventType } from "../../types/events.js"

function convertMessages(messages: Message[]): MessageParam[] {
  const params: MessageParam[] = []
  for (const msg of messages) {
    if (msg.role === 'user') {
      params.push({ role: 'user', content: msg.content })
    } else if (msg.role === 'assistant') {
      const blocks: ContentBlockParam[] = []
      if (msg.content) {
        blocks.push({ type: 'text', text: msg.content })
      }
      if (msg.tool_calls) {
        for (const tc of msg.tool_calls) {
          blocks.push({
            type: 'tool_use',
            id: tc.id,
            name: tc.function.name,
            input: JSON.parse(tc.function.arguments || '{}')
          })
        }
      }
      params.push({
        role: 'assistant',
        content: blocks.length > 0 ? blocks : [{ type: 'text', text: '' }]
      })
    } else if (msg.role === 'tool') {
      const toolResult: ToolResultBlockParam = {
        type: 'tool_result',
        tool_use_id: msg.tool_call_id,
        content: msg.content
      }
      const last = params[params.length - 1]
      if (last && last.role === 'user' && Array.isArray(last.content)) {
        (last.content as ContentBlockParam[]).push(toolResult)
      } else {
        params.push({ role: 'user', content: [toolResult] })
      }
    }
  }
  return params
}

function convertTools(toolsDefinitions: ToolDefinition[]): Tool[] {
  return toolsDefinitions.map(t => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters as Tool.InputSchema
  }))
}

export async function* AnthropicThink(
  modelConfig: ModelConfig,
  messages: Message[],
  toolsDefinitions: ToolDefinition[],
  systemPrompt: string,
): AsyncIterableIterator<eventType> {
  const client = new Anthropic({
    baseURL: modelConfig.baseURL || undefined,
    apiKey: modelConfig.apiKey,
    defaultHeaders: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${modelConfig.apiKey}`,
    }
  })
  try {
    const stream = await client.messages.create({
      model: modelConfig.modelName,
      system: systemPrompt,
      messages: convertMessages(messages),
      tools: toolsDefinitions.length > 0 ? convertTools(toolsDefinitions) : undefined,
      max_tokens: 16000,
      thinking: { type: 'enabled', budget_tokens: 10000 },
      stream: true
    })

    const toolUseMap = new Map<number, { id: string, name: string, inputJson: string }>()
    let stopReason: string = ""
    let inputTokens = 0
    let cacheReadTokens = 0

    for await (const event of stream as AsyncIterable<RawMessageStreamEvent>) {
      switch (event.type) {
        case 'message_start':
          inputTokens = event.message.usage.input_tokens
          cacheReadTokens = event.message.usage.cache_read_input_tokens || 0
          break
        case 'content_block_start':
          if (event.content_block.type === 'tool_use') {
            toolUseMap.set(event.index, {
              id: event.content_block.id,
              name: event.content_block.name,
              inputJson: ''
            })
          }
          break
        case 'content_block_delta':
          if (event.delta.type === 'thinking_delta') {
            const rc = event.delta.thinking
            rc.trim() && ( yield { type: 'thinking', chunk: rc.trim() } )
          } else if (event.delta.type === 'text_delta') {
            const text = event.delta.text
            text.trim() && ( yield { type: 'content', chunk: text.trim() } )
          } else if (event.delta.type === 'input_json_delta') {
            const entry = toolUseMap.get(event.index)
            if (entry) {
              entry.inputJson += event.delta.partial_json
            }
          }
          break
        case 'message_delta':
          if (event.delta.stop_reason) {
            stopReason = event.delta.stop_reason
          }
          if (event.usage) {
            inputTokens = event.usage.input_tokens || inputTokens
            cacheReadTokens = event.usage.cache_read_input_tokens || cacheReadTokens
          }
          break
      }
    }

    const toolCalls: ToolCall[] = []
    for (const [, entry] of toolUseMap) {
      toolCalls.push({
        id: entry.id,
        type: 'function',
        function: {
          name: entry.name,
          arguments: entry.inputJson || '{}'
        }
      })
    }
    yield { type: "tool_calls", calls: toolCalls }

    if (inputTokens > 0 || cacheReadTokens > 0) {
      const totalInputTokens = inputTokens + cacheReadTokens
      const cacheHitRate = totalInputTokens > 0
        ? ((cacheReadTokens / totalInputTokens) * 100).toFixed(1)
        : '0.0'
      yield { type: "usage", metrics: `📊 Token 统计: 总数 ${totalInputTokens} | 缓存命中 ${cacheReadTokens} | 命中率 ${cacheHitRate}%` }
    }

    if (stopReason && !['end_turn', 'tool_use'].includes(stopReason)) {
      const warningMsg = `⚠️ 当前输出被强制中断，原因: ${stopReason}`
      yield { type: "warn", message: warningMsg.trim() }
    }

    yield { type: "done" }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    yield { type: "error", message: `${modelConfig.serviceProvider} 连接失败: ${message}` }
  }
}
