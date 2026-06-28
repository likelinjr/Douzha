import * as musicTools from './tools.js'

export const music_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'play_song': (args) => musicTools.playSong(args.file_path),
  'play_folder': (args) => musicTools.playFolder(args.folder_path),
  'shuffle_play': (args) => musicTools.shufflePlay(args.folder_path),
  'loop_song': (args) => musicTools.loopSong(args.file_path),
  'loop_folder': (args) => musicTools.loopFolder(args.folder_path),
  'stop_music': () => musicTools.stopMusic(),
}
