import * as searchTools from './tools.js'

export const webSearch_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'web_search': (args) => searchTools.webSearch(args.query),
}