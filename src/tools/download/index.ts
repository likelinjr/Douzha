import * as downloadTools from './tools.js'

export const download_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'download_file': (args) => downloadTools.downloadFile(
    args.url,
    args.filename
  ),
}
