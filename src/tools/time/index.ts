import * as timeTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const time_toolHandlers: ToolHandlers = {
  'get_current_time': () => timeTools.getCurrentTime(),
}