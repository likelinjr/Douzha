import * as historyTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const history_toolHandlers: ToolHandlers = {
  'list_sessions': () => historyTools.listSessions(),
  'get_session_detail': (args) => historyTools.getSessionDetail({
    sessionId: args.session_id,
    limit: args.limit,
    offset: args.offset
  }),
}