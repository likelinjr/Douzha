import * as searchTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const webSearch_toolHandlers: ToolHandlers = {
  'web_search': (args) => searchTools.webSearch(args.query),
}