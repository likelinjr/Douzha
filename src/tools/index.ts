import { ToolDefinition } from '../types/tool.js'
import { fileToolsDefinition } from './file/definition.js'
import { file_toolHandlers } from './file/index.js'
import { planToolsDefinition } from './plan/definition.js'
import { plan_toolHandlers } from './plan/index.js'
import { webSearchToolsDefinition } from './webSearch/definition.js'
import { webSearch_toolHandlers } from './webSearch/index.js'
import { commandToolsDefinition } from './command/definition.js'
import { command_toolHandlers } from './command/index.js'
import { weatherToolsDefinition } from './weather/definition.js'
import { weather_toolHandlers } from './weather/index.js'
import { httpToolsDefinition } from './httpRequest/definition.js'
import { http_toolHandlers } from './httpRequest/index.js'
import { historyToolsDefinition } from './history/definition.js'
import { history_toolHandlers } from './history/index.js'
import { downloadToolsDefinition } from './download/definition.js'
import { download_toolHandlers } from './download/index.js'
import { extractToolsDefinition } from './extract/definition.js'
import { extract_toolHandlers } from './extract/index.js'
import { musicToolsDefinition } from './music/definition.js'
import { music_toolHandlers } from './music/index.js'

export const allToolsDefinition :ToolDefinition[] = [
  ...fileToolsDefinition,
  ...planToolsDefinition,
  ...webSearchToolsDefinition,
  ...commandToolsDefinition,
  ...weatherToolsDefinition,
  ...httpToolsDefinition,
  ...historyToolsDefinition,
  ...downloadToolsDefinition,
  ...extractToolsDefinition,
  ...musicToolsDefinition
]

export const toolHandlers: Record<string, (args: any) => Promise<string>> = {
  ...file_toolHandlers,
  ...plan_toolHandlers,
  ...webSearch_toolHandlers,
  ...command_toolHandlers,
  ...weather_toolHandlers,
  ...http_toolHandlers,
  ...history_toolHandlers,
  ...download_toolHandlers,
  ...extract_toolHandlers,
  ...music_toolHandlers
}