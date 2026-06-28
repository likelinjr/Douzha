import OpenAI from "openai"
import { Message, AssistantMessage, AIResponse, ToolCall } from '../../types/message.js'
import { REASONING_COLOR, RESET } from "../../config/themes/colors.js"
import { ToolDefinition } from "../../types/tool.js"
import { commonLog, DEBUG, toolLog } from "../../utils/debug.js"
import { ModelConfig } from "../../types/modelConfig.js"

export async function OpenAICompatThink(
  modelConfig: ModelConfig,
  messages: Message[], 
  toolsDefinitions: ToolDefinition[], 
  systemPrompt: string, 
  options?: { onContent?: (text: string) => void, onThinking?: (text: string) => void }
): Promise<AIResponse> {
  const client = new OpenAI({
    baseURL: modelConfig.baseURL,
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
      stream: true
    })
    let fullContent = ""
    let fullReasoningContent = ""
    let toolCalls: ToolCall[] = []
    let finishReason: string = ""
    let isThinking = false
    for await (const chunk of stream) {
      if (!chunk.choices || chunk.choices.length === 0) {
        continue 
      }
      const choice = chunk.choices[0]
      const delta = choice.delta
      if (choice.finish_reason) {
        finishReason = choice.finish_reason
      }
      if ((delta as any).reasoning_content) {
        isThinking = true
        const rc = (delta as any).reasoning_content
        fullReasoningContent += rc
        DEBUG && rc.trim() && process.stdout.write(`${REASONING_COLOR}${rc}${RESET}`)
        if (rc.trim()) {
          options?.onThinking?.(rc)
        }
      }
      if (delta.content) {
        if (isThinking) {
          if (delta.content.trim() !== "") {
            console.log("\n")
          }
          isThinking = false
        }
        fullContent += delta.content
        DEBUG && delta.content.trim() && process.stdout.write(delta.content)
        if (delta.content.trim()) {
          options?.onContent?.(delta.content)
        }
      }
      if (delta.tool_calls) {
        delta.tool_calls.forEach((tc) => {
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
        })
      }
    }

    if (finishReason && !['stop', 'tool_calls'].includes(finishReason)) {
      const warningMsg = `\n⚠️ 当前输出被强制中断，原因: ${finishReason}`
      fullContent += warningMsg
      commonLog(warningMsg)
    }

    const finalMessage: AssistantMessage = {
      role: "assistant",
      content: fullContent || "",
      reasoning_content: fullReasoningContent || undefined,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    }

    if (toolCalls.length > 0) {
      toolLog(`\n\n📋 ${modelConfig.modelName} 返回 ${toolCalls.length} 个工具调用`)
      const actions = toolCalls.map(toolCall => ({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments || "{}")
      }))
      return {
        actions,
        answer: fullContent || "",
        raw: finalMessage
      }
    }

    return {
      answer: fullContent || "",
      raw: finalMessage
    }
  } catch (error: any) {
    console.error(`${modelConfig.serviceProvider} 出错了:`, error.message)
    return {
      answer: `${modelConfig.serviceProvider} 服务器连接失败: ${error.message}`,
    }
  }
}
