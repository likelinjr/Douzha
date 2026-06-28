import { GoogleGenerativeAI, FunctionDeclaration, FunctionCall } from "@google/generative-ai"
import { Message, AIResponse } from '../../types/message.js'
import { REASONING_COLOR, RESET } from "../../config/themes/colors.js"
import { ToolDefinition } from "../../types/tool.js"
import { toolLog, DEBUG } from "../../utils/debug.js"
import { initProxy } from "../../utils/proxy.js"
import { ModelConfig } from "../../types/modelConfig.js"
import dotenv from 'dotenv'
dotenv.config()

export async function Gemini(
  modelConfig: ModelConfig,
  messages: Message[], 
  toolsDefinitions :ToolDefinition[], 
  systemPrompt: string, 
  options?: { onContent?: (text: string) => void; onThinking?: (text: string) => void }
): Promise<AIResponse> {
  initProxy()
  const genAI = new GoogleGenerativeAI(modelConfig.apiKey)
  try {
    const model = genAI.getGenerativeModel({ 
      model: modelConfig.modelName,
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: toolsDefinitions.map(t => t.function) as FunctionDeclaration[]
      }]
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
    let fullReasoningContent = ""
    const finalFunctionCalls: FunctionCall[] = []
    let isThinking = false
    for await (const chunk of result.stream) {
      const parts = chunk.candidates?.[0]?.content.parts
      if (parts) {
        for (const part of parts) {
          if ((part as any).thought) {
            isThinking = true
            const rc = part.text || ""
            fullReasoningContent += rc
            DEBUG && rc.trim() && process.stdout.write(`${REASONING_COLOR}${rc}${RESET}`)
            if (rc.trim()) options?.onThinking?.(rc)
            continue
          }
          if (part.text) {
            if (isThinking) {
              DEBUG && console.log("\n")
              isThinking = false
            }
            const text = part.text
            fullContent += text
            DEBUG && process.stdout.write(String(text))
            if (text.trim()) options?.onContent?.(text)
          }
          if (part.functionCall) {
            finalFunctionCalls.push(part.functionCall)
          }
        }
      }
    }
    if (finalFunctionCalls.length > 0) {
      const toolCallsInfo = finalFunctionCalls.map(fc => fc.name).join(', ')
      toolLog(`\n\n📋 ${modelConfig.modelName} 返回工具调用: ${toolCallsInfo}`)
      const actions = finalFunctionCalls.map(fc => ({
        id: `${fc.name}-${Date.now()}`,
        name: fc.name,
        arguments: fc.args
      }))
      const tool_calls = finalFunctionCalls.map(fc => ({
        id: `${fc.name}-${Date.now()}`,
        type: "function" as const,
        function: { name: fc.name, arguments: JSON.stringify(fc.args) }
      }))
      return {
        actions,
        answer: fullContent || "",
        raw: {
          role: 'assistant',
          content: fullContent || "",
          reasoning_content: fullReasoningContent || undefined,
          tool_calls
        }
      }
    }

    return {
      answer: fullContent || "",
      raw: {
        role: 'assistant',
        content: fullContent || "",
        reasoning_content: fullReasoningContent || undefined,
      }
    }
  } catch (error: any) {
    console.error('Gemini 出错了:', error.message)
    return {
      answer: `Gemini 服务器连接失败: ${error.message}`
    }
  }
}