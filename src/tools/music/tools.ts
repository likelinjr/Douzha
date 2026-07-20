import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { validatePath, sanitizePaths } from '../../utils/security.js'
import { ToolResult } from '../../types/tool.js'
const execAsync = promisify(exec)

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.flac', '.wav', '.aac', '.ogg', '.m4a', '.wma', '.opus', '.ape', '.alac'
])

function isAudioFile(filePath: string): boolean {
  return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase())
}

function getAudioFilesInDir(dirPath: string): string[] {
  try {
    const files = fs.readdirSync(dirPath)
    return files
      .filter(f => isAudioFile(f))
      .map(f => path.join(dirPath, f))
  } catch {
    return []
  }
}

export async function playSong(filePath: string, loop?: boolean): Promise<ToolResult> {
  try {
    const resolved = validatePath(filePath)
    if (!fs.existsSync(resolved)) {
      return {
        content: [{ type: "text", text: sanitizePaths(`文件不存在: ${filePath}`) }],
        isError: true
      }
    }
    if (!isAudioFile(resolved)) {
      return {
        content: [{ type: "text", text: sanitizePaths(`不是支持的音频文件: ${path.extname(resolved)}`) }],
        isError: true
      }
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const loopFlag = loop ? '--loop=inf' : ''
    const command = `start /b mpv --no-video ${loopFlag} "${resolved}"`
    exec(command)
    return {
      content: [{ type: "text", text: `正在${loop ? "单曲循环":"播放"}: ${path.basename(resolved)}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`播放失败: ${message}`) }],
      isError: true
    }
  }
}

export async function playFolder(folderPath: string, loop?: boolean, shuffle?: boolean): Promise<ToolResult> {
  try {
    const resolved = validatePath(folderPath)
    if (!fs.existsSync(resolved)) {
      return {
        content: [{ type: "text", text: sanitizePaths(`文件夹不存在: ${folderPath}`) }],
        isError: true
      }
    }
    const stat = fs.statSync(resolved)
    if (!stat.isDirectory()) {
      return {
        content: [{ type: "text", text: sanitizePaths(`路径不是文件夹: ${folderPath}`) }],
        isError: true
      }
    }
    const audioFiles = getAudioFilesInDir(resolved)
    if (audioFiles.length === 0) {
      return {
        content: [{ type: "text", text: sanitizePaths(`文件夹中没有音频文件: ${folderPath}`) }],
        isError: true
      }
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const shuffleFlag = shuffle ? '--shuffle' : ''
    const loopFlag = loop ? '--loop-playlist=inf' : ''
    const command = `start /b mpv --no-video ${shuffleFlag} ${loopFlag} "${resolved}"`
    exec(command)
    const mode = shuffle ? '随机播放' : loop ? '列表循环' : '播放'
    return {
      content: [{ type: "text", text: `正在${mode}: ${path.basename(resolved)} (共 ${audioFiles.length} 首音频)` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`播放失败: ${message}`) }],
      isError: true
    }
  }
}

export async function stopMusic(): Promise<ToolResult> {
  try {
    await execAsync('taskkill /f /im mpv.exe')
    return {
      content: [{ type: "text", text: '音乐已停止' }],
      isError: false
    }
  } catch {
    return {
      content: [{ type: "text", text: 'ℹ️ 当前没有正在播放的音乐' }],
      isError: false
    }
  }
}
