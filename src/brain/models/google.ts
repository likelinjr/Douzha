import { GoogleGenerativeAI, FunctionDeclaration, FunctionCall } from "@google/generative-ai"
import { Message } from '../../types/message.js'
import { ToolDefinition } from "../../types/tool.js"
import { eventType } from "../../types/events.js"
import { ModelConfig } from "../../types/modelConfig.js"
import dotenv from 'dotenv'
dotenv.config()

export async function* GoogleThink(
  modelConfig: ModelConfig,
  messages: Message[], 
  toolsDefinitions :ToolDefinition[], 
  systemPrompt: string
): AsyncIterableIterator<eventType> {
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
    const finalFunctionCalls: FunctionCall[] = []

    for await (const chunk of result.stream) {
      const parts = chunk.candidates?.[0]?.content.parts
      if (parts) {
        for (const part of parts) {
          if ((part as { thought?: boolean }).thought) {
            const rc = part.text || ""
            rc.trim() && ( yield { type: "thinking", chunk: rc.trim() } )
            continue
          }
          if (part.text) {
            const text = part.text
            String(text).trim() && ( yield { type: "content", chunk: String(text).trim() } )
          }
          if (part.functionCall) {
            finalFunctionCalls.push(part.functionCall)
          }
        }
      }
    }

    const tool_calls = finalFunctionCalls?.map(fc => ({
      id: `${fc.name}-${Date.now()}`,
      type: "function" as const,
      function: { name: fc.name, arguments: JSON.stringify(fc.args) }
    }))  
    yield { type: "tool_calls", calls: tool_calls }

    yield { type: "done" }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    yield { type: "error", message: `Gemini 连接失败: ${message}` }
  }
}
