import * as extractTools from './tools.js'

export const extract_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'extract_file': (args) => extractTools.extractFile(
    args.filepath,
    args.outputDir
  ),
}
