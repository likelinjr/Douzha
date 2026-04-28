import OpenAI from "openai"
import dotenv from 'dotenv'
import { Message, AIResponse, ToolCall } from '../types/index.js'
import { getSystemPrompt } from "./prompt.js"
import { allToolsDefinition } from "../tools/index.js"
import { THEMS } from "../config/theme.js"

const { REASONING_COLOR, RESET_COLOR } = THEMS

dotenv.config()

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function DeepSeekThink(messages: Message[]): Promise<AIResponse> {
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
        cleanMsg.content = msg.content || ""
      }
      if (msg.role === 'tool') {
        cleanMsg.tool_call_id = msg.tool_call_id
      }
      return cleanMsg
    })
    const stream = await openai.chat.completions.create({
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...sanitizedMessages as any
      ],
      model: process.env.DEEPSEEK_MODEL_NAME || "deepseek-chat",
      tools: allToolsDefinition,
      tool_choice: "auto",
      stream: true
    })

    let fullContent = ""
    let toolCalls: ToolCall[] = []

    let isReasoning = false // 处理思考后换行
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta
      if ((delta as any).reasoning_content) {
        isReasoning = true
        const rc = (delta as any).reasoning_content
        process.stdout.write(`${REASONING_COLOR}${rc}${RESET_COLOR}`)
      }
      if (delta.content) {
        if (isReasoning) {
          process.stdout.write('\n')
          isReasoning = false
        }
        fullContent += delta.content
        process.stdout.write(delta.content)
      }

      if (delta.tool_calls) {
        if (isReasoning) {
          process.stdout.write('\n')
          isReasoning = false
        }
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

    console.log("")

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
    console.error('出错了:', error.message)
    return {
      answer: '我好像跟服务器失联了，请稍后再试。',
    }
  }
}