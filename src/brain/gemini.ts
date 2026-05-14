import { GoogleGenerativeAI } from "@google/generative-ai"
import dotenv from 'dotenv'
import { setGlobalDispatcher, ProxyAgent } from 'undici'
import { Message, AIResponse } from '../types/index.js'
import { REASONING_COLOR, RESET } from "../config/theme.js"
import { ToolDefinition } from "../types/tool.js"
import { toolLog, DEBUG } from "../utils/debug.js"
import { startShimmerText } from "../utils/shimmer.js"

dotenv.config()

if (process.env.HTTPS_PROXY) {
  const dispatcher = new ProxyAgent(process.env.HTTPS_PROXY)
  setGlobalDispatcher(dispatcher)
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function GeminiThink(messages: Message[], toolsDefinitions :ToolDefinition[], systemPrompt: string, isDecide: boolean = false, options?: { onContent?: (text: string) => void; onThinking?: (text: string) => void }): Promise<AIResponse> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GOOGLE_MODEL_NAME || "gemini-3-flash-preview",
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: toolsDefinitions.map(t => t.function) 
      }] as any
    })

    const contents = messages.map(m => {
      if (m.role === 'tool') {
        return {
          role: 'user',
          parts: [{
            functionResponse: {
              name: m.tool_call_id?.split('-')[0] || '', 
              response: { result: m.content }
            }
          }]
        }
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content || '' }]
      }
    })

    const result = await model.generateContentStream({ contents })
    let fullContent = ""
    let finalFunctionCall: any = null
    let stopShimmer: (() => void) | null = null

    if (isDecide && !DEBUG) stopShimmer = startShimmerText('  Thinking...')

    let lastWasThought = false

    DEBUG && console.log("") // 美化输出，思考前换行

    for await (const chunk of result.stream) {
      const parts = chunk.candidates?.[0]?.content.parts
      if (parts) {
        for (const part of parts) {
          if ((part as any).thought) {
            lastWasThought = true
            DEBUG && process.stdout.write(`${REASONING_COLOR}${part.text}${RESET}`)
            if (part.text?.trim()) options?.onThinking?.(part.text)
            continue
          }
          if (part.text) {
            if (stopShimmer) { stopShimmer(); stopShimmer = null }
            if (lastWasThought) {
              DEBUG && console.log("\n") // 美化输出，思考后换行
              lastWasThought = false
            }
            const text = part.text
            fullContent += text
            DEBUG && process.stdout.write(String(text))
            if (text.trim()) options?.onContent?.(text)
          }
          if (part.functionCall) {
            if (lastWasThought) {
              DEBUG && process.stdout.write('\n')
              lastWasThought = false
            }
            finalFunctionCall = part.functionCall
          }
        }
      }
    }

    if (stopShimmer) stopShimmer()

    if (finalFunctionCall) {
      const fc = finalFunctionCall
      const toolCallId = `${fc.name}-${Date.now()}`
      toolLog(`📋 Gemini 返回工具调用: ${fc.name}`)
            
      return {
        actions: [{
          id: toolCallId,
          name: fc.name,
          arguments: fc.args
        }],
        answer: null,
        raw: {
          role: 'assistant',
          content: fullContent || null,
          tool_calls: [{
            id: toolCallId,
            function: { name: fc.name, arguments: JSON.stringify(fc.args) }
          }]
        }
      }
    }

    return {
      answer: fullContent,
      raw: {
        role: 'assistant',
        content: fullContent,
      }
    }

  } catch (error: any) {
    console.error('\n Google 大脑连接失败:', error.message)
    return {
      answer: '我暂时无法连接到 Google 的神经元。'
    }
  }
}