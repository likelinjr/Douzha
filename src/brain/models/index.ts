import { GoogleThink } from './google.js'
import { OpenAIThink } from './openai.js'
import { AnthropicThink } from './anthropic.js'
import { Message } from '../../types/message.js'
import { ToolDefinition } from '../../types/tool.js'
import { ModelConfig } from '../../types/modelConfig.js'
import { initProxy } from "../../utils/proxy.js"
import { eventType } from '../../types/events.js'

export async function* think(
  modelConfig: ModelConfig,
  messages: Message[],
  toolsDefinitions: ToolDefinition[],
  systemPrompt: string
): AsyncIterableIterator<eventType> {
  switch (modelConfig.protocol) {
    case 'Google':
      initProxy()
      yield* GoogleThink(modelConfig, messages, toolsDefinitions, systemPrompt)
      break
    case 'Anthropic':
      if (modelConfig.serviceProvider === 'Anthropic') initProxy()
      yield* AnthropicThink(modelConfig, messages, toolsDefinitions, systemPrompt)
      break
    case 'OpenAI':
      if (modelConfig.serviceProvider === 'OpenAI') initProxy()
      yield* OpenAIThink(modelConfig, messages, toolsDefinitions, systemPrompt)
      break
    default:
      throw new Error(`Unsupported Service Provider: ${modelConfig.serviceProvider}`)
  }
}
