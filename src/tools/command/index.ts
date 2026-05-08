import * as commandTools from './tools.js'

export const command_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'execute_command': (args) => commandTools.executeCommand(args.file, args.args, args.cwd),
}