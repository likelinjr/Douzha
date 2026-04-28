import * as musicTools from './tools.js'

export const music_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'play_online_music': (args) => musicTools.playOnlineMusic(args.keyword),
  'stop_music': () => musicTools.stopMusic(),
}