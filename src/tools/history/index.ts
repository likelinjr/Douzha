// tools/history/index.ts
import * as historyTools from './tools.js'

export const history_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'list_sessions': () => historyTools.listSessions(),
  'get_history_detail': (args) => historyTools.getHistoryDetail(args.session_id, args.plan_id, args.limit, args.offset),
}