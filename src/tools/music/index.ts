import * as musicTools from './tools.js'
import { ToolHandlers } from '../../types/tool.js'

export const music_toolHandlers: ToolHandlers = {
  'play_song': (args) => musicTools.playSong(args.file_path, args.loop),
  'play_folder': (args) => musicTools.playFolder(args.folder_path, args.shuffle, args.loop),
  'stop_music': () => musicTools.stopMusic(),
}
