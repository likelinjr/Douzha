import * as downloadTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const download_toolHandlers: ToolHandlers = {
  'download_file': (args) => downloadTools.downloadFile(
    args.url,
    args.filename
  ),
}
