
import { DeepSeekThink } from './deepseek.js'
import { Message, AIResponse } from '../types/index.js'
import { GeminiThink } from './gemini.js'
import { BigModelThink } from './bigmodel.js'

export async function think(messages: Message[]): Promise<AIResponse> {
  const provider = process.env.ACTIVE_MODEL || 'deepseek'

  switch (provider) {
    case 'deepseek':
      return await DeepSeekThink(messages)
    case 'gemini':
      return await GeminiThink(messages)
    case 'glm':
      return await BigModelThink(messages)
    default:
      return await DeepSeekThink(messages)
  }
}