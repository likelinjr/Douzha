import dotenv from 'dotenv'
import { Message, AIResponse } from '../../types/message.js'
import { ToolDefinition } from '../../types/tool.js'
import { OpenAICompatThink } from './openaiCompat.js'
import { ModelConfig } from '../../types/modelConfig.js'
dotenv.config()

export async function BigModel(
  modelConfig: ModelConfig,
  messages: Message[], 
  toolsDefinitions: ToolDefinition[], 
  systemPrompt: string, 
  options?: { onContent?: (text: string) => void, onThinking?: (text: string) => void }
): Promise<AIResponse> {
  return OpenAICompatThink(
    modelConfig,
    messages,
    toolsDefinitions,
    systemPrompt,
    options
  )
}