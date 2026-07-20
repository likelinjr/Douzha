import * as commandTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const command_toolHandlers: ToolHandlers = {
  'execute_command': (args) => commandTools.executeCommand(args.command),
}