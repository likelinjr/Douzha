import * as videoTools from './tools.js'

export const video_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'play_online_video': (args) => videoTools.playOnlineVideo(args.keyword),
  'stop_video': () => videoTools.stopVideo(),
}