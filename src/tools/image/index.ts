import * as imageTools from './tools.js'
import { ToolHandlers } from '../../types/tool.js'

export const image_toolHandlers: ToolHandlers = {
  'image_to_base64': (args) => imageTools.imageToBase64(args),
}
