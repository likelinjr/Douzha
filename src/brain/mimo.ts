import OpenAI from "openai"
import dotenv from 'dotenv'
import { Message, AIResponse, ToolCall } from '../types/index.js'
import { THEMS } from "../config/theme.js"
import { ToolDefinition } from "../types/tool.js"
import { commonLog, DEBUG_CHAT, DEBUG_THINK, toolLog } from "../utils/debug.js"
import { startShimmerText } from "../utils/shimmer.js"

const { REASONING_COLOR, RESET_COLOR } = THEMS

dotenv.config()

const mimoClient = new OpenAI({
  baseURL: "https://token-plan-cn.xiaomimimo.com/v1", 
  apiKey: process.env.MIMO_API_KEY,
})

export async function MimoThink(messages: Message[], toolsDefinitions: ToolDefinition[], systemPrompt: string, isDecide: boolean = false): Promise<AIResponse> {
  try {
    const sanitizedMessages = messages.map((msg: Message) => {
      const cleanMsg: Message = {
        role: msg.role,
        content: msg.content || ""
      }
      if (msg.tool_calls && msg.tool_calls.length > 0) {
        cleanMsg.tool_calls = msg.tool_calls.map((call: ToolCall) => ({
          id: call.id,
          type: "function",
          function: {
            name: call.function.name,
            arguments: typeof call.function.arguments === 'string'
              ? call.function.arguments
              : JSON.stringify(call.function.arguments)
          }
        }))
      }
      if (msg.role === 'tool') {
        cleanMsg.tool_call_id = msg.tool_call_id
      }
      return cleanMsg
    })

    const stream = await mimoClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...sanitizedMessages as any
      ],
      model: process.env.MIMO_MODEL_NAME || "MiMo-V2.5", 
      tools: toolsDefinitions.length > 0 ? toolsDefinitions : undefined,
      tool_choice: toolsDefinitions.length > 0 ? "auto" : undefined,
      stream: true
    })

    let fullContent = ""
    let toolCalls: ToolCall[] = []
    let finishReason: string | null = null
    let isThinking = false

    let stopThinkShimmer: (() => void) | null = null
    let stopWorkingShimmer: (() => void) | null = null
    let work_shimmer = false
    let think_shimmer = false
    let lastActiveTime = Date.now()

    const blockageMonitor = !DEBUG_CHAT ? setInterval(() => {
      const silentDuration = Date.now() - lastActiveTime
      if (silentDuration > 2000 && !work_shimmer) {
        stopWorkingShimmer = startShimmerText('  Working...')
        work_shimmer = true
      }
    }, 1000) : 0

    if (!DEBUG_THINK) {
      stopThinkShimmer = startShimmerText('  Thinking...')
      think_shimmer = true
    }

    try {
      for await (const chunk of stream) {
        !DEBUG_CHAT && (lastActiveTime = Date.now())

        // 🟢 新增这 3 行：安全校验，跳过没有 choices 的 chunk（例如结尾的 token 统计）
        if (!chunk.choices || chunk.choices.length === 0) {
          continue 
        }

        const choice = chunk.choices[0]
        const delta = choice.delta
        if (choice.finish_reason) {
          finishReason = choice.finish_reason
        }

        const rc = (delta as any).reasoning_content
        if (rc) {
          if (!isThinking) {
            isThinking = true
            if (think_shimmer && stopThinkShimmer) {
              stopThinkShimmer()
              stopThinkShimmer = null
              think_shimmer = false
            }
          }
          DEBUG_THINK && process.stdout.write(`${REASONING_COLOR}${rc}${RESET_COLOR}`)
        }

        if (delta.content) {
          if (isThinking) {
            if (DEBUG_THINK && delta.content.trim() !== "") {
              console.log("")
            }
            isThinking = false
          }

          if (think_shimmer && stopThinkShimmer) {
            stopThinkShimmer()
            stopThinkShimmer = null
            think_shimmer = false
          }

          fullContent += delta.content;
          (DEBUG_THINK || !isDecide) && process.stdout.write(delta.content)
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
    } finally {
      if (stopThinkShimmer) stopThinkShimmer()
      if (stopWorkingShimmer) (stopWorkingShimmer as () => void)()
      clearInterval(blockageMonitor)
    }

    if (finishReason && !['stop', 'tool_calls'].includes(finishReason)) {
      const warningMsg = `\n\n[⚠️ 当前输出被强制中断，原因: ${finishReason}]`
      fullContent += warningMsg
      !isDecide && process.stdout.write(warningMsg)
      commonLog(`\n🔴 拦截到异常停止状态: ${finishReason}`)
    }

    const finalMessage: Message = {
      role: "assistant",
      content: fullContent || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    }

    if (toolCalls.length > 0) {
      toolLog(`📋 Mimo 返回 ${toolCalls.length} 个工具调用`)
      const actions = toolCalls.map(toolCall => ({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments || "{}")
      }))

      return {
        actions,
        answer: fullContent,
        raw: finalMessage
      }
    }

    return {
      answer: fullContent,
      raw: finalMessage
    }

  } catch (error: any) {
    console.error('\n🧠 Mimo AI 出错了:', error.message)
    return {
      answer: `Mimo 服务器连接失败: ${error.message}`,
    }
  }
}