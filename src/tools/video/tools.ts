import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function playOnlineVideo(keyword: string): Promise<string> {
  try {
    const searchKeyword = `${keyword} bilibili`
    const command = `start /b mpv --fs --ontop --ytdl-format="bestvideo+bestaudio/best" --ytdl-raw-options="cookies=C:/tools/cookies.txt,user-agent='Mozilla/5.0',referer='https://www.bilibili.com'" "ytdl://ytsearch1:${searchKeyword}"`
    exec(command) 
    return `✅ 正在为你播放高清视频: ${keyword}。已挂载本地 Cookie。`
  } catch (error: any) {
    return `❌ 视频启动失败: ${error.message}`
  }
}

export async function stopVideo(): Promise<string> {
  try {
    const stopCommand = `taskkill /f /im mpv.exe`
    await execAsync(stopCommand)
    return "✅ 视频已关闭。"
  } catch {
    return "ℹ️ 当前没有正在运行的视频进程。"
  }
}