import * as httpTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const http_toolHandlers: ToolHandlers = {
  'http_request': (args) => httpTools.httpRequest(
    args.url, 
    args.method, 
    args.headers, 
    args.body
  ),
}