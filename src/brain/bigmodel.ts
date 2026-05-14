import OpenAI from "openai"
import dotenv from 'dotenv'
import { Message, AIResponse, ToolCall } from '../types/index.js'
import { REASONING_COLOR, RESET } from "../config/theme.js"
import { ToolDefinition } from "../types/tool.js"
import { commonLog, DEBUG, toolLog } from "../utils/debug.js"

dotenv.config()

const zhipuOpenai = new OpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4/", 
  apiKey: process.env.ZHIPU_API_KEY,
})

export async function BigModelThink(messages: Message[], toolsDefinitions :ToolDefinition[], systemPrompt: string, isDecide: boolean = false, options?: { onContent?: (text: string) => void, onThinking?: (text: string) => void }): Promise<AIResponse> {
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
        { role: "system", content: systemPrompt },
        ...sanitizedMessages as any
      ],
      model: process.env.ZHIPU_MODEL_NAME || "glm-4.5-air", 
      tools: toolsDefinitions,
      tool_choice: "auto",
      stream: true
    })

    let fullContent = ""
    let toolCalls: ToolCall[] = []
    let finishReason: string | null = null // 用于记录流结束的原因
    let isThinking = false    

    for await (const chunk of stream) {
    
      const choice = chunk.choices[0]
      const delta = choice.delta
      if (choice.finish_reason) {
        finishReason = choice.finish_reason // 用于记录流结束的原因
      }
 
      // 思考过程...
      if ((delta as any).reasoning_content) {
        isThinking = true
        const rc = (delta as any).reasoning_content
        DEBUG && rc.trim() && process.stdout.write(`${REASONING_COLOR}${rc}${RESET}`)
        if (rc.trim()) {
          options?.onThinking?.(rc)
        }
      }

      if (delta.content) {
        if(isThinking && DEBUG && delta.content.trim() !== ""){
          console.log("")
          isThinking = false
        }
        if (isThinking) {
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

    if (finishReason && finishReason !== 'stop' && finishReason !== 'tool_calls') {
      const warningMsg = `\n\n[⚠️ 当前输出被强制中断，原因: ${finishReason}]`
      fullContent += warningMsg
      !isDecide && process.stdout.write(warningMsg)
      commonLog(`\n🔴 拦截到异常停止状态: ${finishReason}`)
    }

    const finalMessage :Message = {
      role: "assistant",
      content: fullContent || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    }

    if (toolCalls.length > 0) {
      toolLog(`📋 模型返回 ${toolCalls.length} 个工具调用`)
      const actions = toolCalls.map(toolCall => ({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments)
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
    console.error('\n🧠 智谱大脑出错了:', error.message)
    return {
      answer: '智谱服务器连接失败，请检查 API Key 或网络状况。',
    }
  }
}