import * as sessionTools from './tools.js'

export const session_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'create_new_session': (args) => sessionTools.createNewSession(args.summary, args?.planId),
}