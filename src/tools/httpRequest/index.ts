import * as httpTools from './tools.js'

export const http_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'http_request': (args) => httpTools.httpRequest(
    args.url, 
    args.method, 
    args.headers, 
    args.body
  ),
}