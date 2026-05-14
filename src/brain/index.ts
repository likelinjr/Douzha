
import { DeepSeekThink } from './deepseek.js'
import { Message, AIResponse } from '../types/index.js'
import { GeminiThink } from './gemini.js'
import { BigModelThink } from './bigmodel.js'
import { ToolDefinition } from '../types/tool.js'
import { MimoThink } from './mimo.js'

export async function think(messages: Message[], toolsDefinitions: ToolDefinition[], systemPrompt: string, model: string, isDecide: boolean = false, options?: { onContent?: (text: string) => void; onThinking?: (text: string) => void }): Promise<AIResponse> {
  switch (model) {
    case 'deepseek':
      return await DeepSeekThink(messages, toolsDefinitions, systemPrompt, isDecide, options)
    case 'gemini':
      return await GeminiThink(messages, toolsDefinitions, systemPrompt, isDecide, options)
    case 'glm':
      return await BigModelThink(messages, toolsDefinitions, systemPrompt, isDecide, options)
    case 'mimo':
      return await MimoThink(messages, toolsDefinitions, systemPrompt, isDecide, options)
    default:
      return await DeepSeekThink(messages, toolsDefinitions, systemPrompt, isDecide, options)
  }
}