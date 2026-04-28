import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function playOnlineMusic(keyword: string): Promise<string> {
  try {
    const searchKeyword = `${keyword} bilibili`
    const command = `start /b mpv --no-video "ytdl://ytsearch1:${searchKeyword}"`
    exec(command) 
    return `✅ 正在为你搜寻并播放: ${keyword}。请确保扬声器音量正常。`
  } catch (error: any) {
    return `❌ 播放失败: ${error.message}`
  }
}

export async function stopMusic(): Promise<string> {
  try {
    const stopCommand = `taskkill /f /im mpv.exe`
    await execAsync(stopCommand)
    return "✅ 音乐已停止播放。"
  } catch {
    return "ℹ️ 当前似乎没有正在运行的播放进程。"
  }
}