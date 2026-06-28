import { DeepSeek} from './deepseek.js'
import { Message, AIResponse } from '../../types/message.js'
import { Gemini} from './gemini.js'
import { BigModel} from './bigmodel.js'
import { ToolDefinition } from '../../types/tool.js'
import { Mimo } from './mimo.js'
import { ModelConfig } from '../../types/modelConfig.js'

export async function think(modelConfig: ModelConfig, messages: Message[], toolsDefinitions: ToolDefinition[], systemPrompt: string, options?: { onContent?: (text: string) => void; onThinking?: (text: string) => void }): Promise<AIResponse> {
  switch (modelConfig.serviceProvider) {
    case 'DeepSeek':
      return await DeepSeek(modelConfig, messages, toolsDefinitions, systemPrompt, options)
    case 'Gemini':
      return await Gemini(modelConfig, messages, toolsDefinitions, systemPrompt, options)
    case 'BigModel':
      return await BigModel(modelConfig, messages, toolsDefinitions, systemPrompt, options)
    case 'Mimo':
      return await Mimo(modelConfig, messages, toolsDefinitions, systemPrompt, options)
    default:
      return await DeepSeek(modelConfig, messages, toolsDefinitions, systemPrompt, options)
  }
}