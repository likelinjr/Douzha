import OpenAI from "openai"
import dotenv from 'dotenv'
import { Message, AIResponse, ToolCall } from '../types/index.js'
import { getSystemPrompt } from "./prompt.js"
import { allToolsDefinition } from "../tools/index.js"
import { THEMS } from "../config/theme.js"

const { REASONING_COLOR, RESET_COLOR } = THEMS

dotenv.config()

const zhipuOpenai = new OpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4/", 
  apiKey: process.env.ZHIPU_API_KEY,
})

export async function BigModelThink(messages: Message[]): Promise<AIResponse> {
  try {
    const sanitizedMessages = messages.map((msg: Message) => {
      const cleanMsg :Message = {
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
        cleanMsg.content = msg.content || ""
      }
      if (msg.role === 'tool') {
        cleanMsg.tool_call_id = msg.tool_call_id
      }
      return cleanMsg
    })

    const stream = await zhipuOpenai.chat.completions.create({
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...sanitizedMessages as any
      ],
      model: process.env.ZHIPU_MODEL_NAME || "glm-4.5-air", 
      tools: allToolsDefinition,
      tool_choice: "auto",
      stream: true
    })

    let fullContent = ""
    let toolCalls: ToolCall[] = []
    let finishReason: string | null = null // 用于记录流结束的原因

    for await (const chunk of stream) {
      const choice = chunk.choices[0]
      const delta = choice.delta

      if (choice.finish_reason) {
        finishReason = choice.finish_reason
      }

      if ((delta as any).reasoning_content) {
        const rc = (delta as any).reasoning_content
        process.stdout.write(`${REASONING_COLOR}${rc}${RESET_COLOR}`)
      }

      if (delta.content) {
        fullContent += delta.content
        process.stdout.write(delta.content)
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

    if (finishReason && finishReason !== 'stop' && finishReason !== 'tool_calls') {
      const warningMsg = `\n\n[⚠️ 警告：当前输出被强制中断，原因: ${finishReason}。极可能触发了模型安全审查限制。]`
      fullContent += warningMsg
      process.stdout.write(warningMsg)
      console.log(`\n🔴 拦截到异常停止状态: ${finishReason}`)
    }

    const finalMessage :Message = {
      role: "assistant",
      content: fullContent || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    }

    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0] 
      return {
        action: {
          id: toolCall.id,
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments)
        },
        answer: fullContent,
        raw: finalMessage 
      }
    }
        
    return {
      answer: fullContent,
      raw: finalMessage
    }

  } catch (error: any) {
    console.error('\n🧠 智谱大脑出错了:', error.message)
    return {
      answer: '智谱服务器连接失败，请检查 API Key 或网络状况。',
    }
  }
}