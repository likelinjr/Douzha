import OpenAI from "openai"
import dotenv from 'dotenv'
import { Message, AIResponse, ToolCall } from '../types/index.js'
import { REASONING_COLOR, RESET } from "../config/theme.js"
import { ToolDefinition } from "../types/tool.js"
import { DEBUG, toolLog } from "../utils/debug.js"
import { startShimmerText } from "../utils/shimmer.js"

dotenv.config()

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_BASE_URL,
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export async function DeepSeekThink(messages: Message[], toolsDefinitions :ToolDefinition[], systemPrompt: string, isDecide: boolean = false, options?: { onContent?: (text: string) => void; onThinking?: (text: string) => void }): Promise<AIResponse> {
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
        { role: "system", content: systemPrompt },
        ...sanitizedMessages as any
      ],
      model: process.env.DEEPSEEK_MODEL_NAME || "deepseek-chat",
      tools: toolsDefinitions,
      tool_choice: "auto",
      stream: true
    })

    let fullContent = ""
    let toolCalls: ToolCall[] = []
    let stopShimmer: (() => void) | null = null

    if (isDecide && !DEBUG) stopShimmer = startShimmerText('  Thinking...')

    let isReasoning = false
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta
      if ((delta as any).reasoning_content) {
        isReasoning = true
        const rc = (delta as any).reasoning_content
        DEBUG && process.stdout.write(`${REASONING_COLOR}${rc}${RESET}`)
        if (rc.trim()) options?.onThinking?.(rc)
      }
      if (delta.content) {
        if (stopShimmer) { stopShimmer(); stopShimmer = null }
        if (isReasoning) {
          DEBUG && !isDecide && process.stdout.write('\n')
          isReasoning = false
        }
        fullContent += delta.content
        DEBUG && process.stdout.write(delta.content)
        if (delta.content.trim()) options?.onContent?.(delta.content)
      }

      if (delta.tool_calls) {
        if (isReasoning) {
          DEBUG && process.stdout.write('\n')
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

    if (stopShimmer) stopShimmer()

    const finalMessage :Message = {
      role: "assistant",
      content: fullContent || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    }
        
    if (toolCalls.length > 0) {
      toolLog(`📋 DeepSeek 返回 ${toolCalls.length} 个工具调用`)
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
    console.error('出错了:', error.message)
    return {
      answer: '我好像跟服务器失联了，请稍后再试。',
    }
  }
}