import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { validatePath } from '../../utils/security.js'

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

export async function playSong(filePath: string): Promise<string> {
  try {
    const resolved = validatePath(filePath)
    if (!fs.existsSync(resolved)) {
      return `❌ 文件不存在: ${filePath}`
    }
    if (!isAudioFile(resolved)) {
      return `❌ 不是支持的音频文件: ${path.extname(resolved)}`
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const command = `start /b mpv --no-video "${resolved}"`
    exec(command)
    return `✅ 正在播放: ${path.basename(resolved)}`
  } catch (error: any) {
    return `❌ 播放失败: ${error.message}`
  }
}

export async function playFolder(folderPath: string): Promise<string> {
  try {
    const resolved = validatePath(folderPath)
    if (!fs.existsSync(resolved)) {
      return `❌ 文件夹不存在: ${folderPath}`
    }
    const stat = fs.statSync(resolved)
    if (!stat.isDirectory()) {
      return `❌ 路径不是文件夹: ${folderPath}`
    }
    const audioFiles = getAudioFilesInDir(resolved)
    if (audioFiles.length === 0) {
      return `❌ 文件夹中没有音频文件: ${folderPath}`
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const command = `start /b mpv --no-video "${resolved}"`
    exec(command)
    return `✅ 正在播放文件夹: ${path.basename(resolved)} (共 ${audioFiles.length} 首音频)`
  } catch (error: any) {
    return `❌ 播放失败: ${error.message}`
  }
}

export async function shufflePlay(folderPath: string): Promise<string> {
  try {
    const resolved = validatePath(folderPath)
    if (!fs.existsSync(resolved)) {
      return `❌ 文件夹不存在: ${folderPath}`
    }
    const stat = fs.statSync(resolved)
    if (!stat.isDirectory()) {
      return `❌ 路径不是文件夹: ${folderPath}`
    }
    const audioFiles = getAudioFilesInDir(resolved)
    if (audioFiles.length === 0) {
      return `❌ 文件夹中没有音频文件: ${folderPath}`
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const command = `start /b mpv --no-video --shuffle "${resolved}"`
    exec(command)
    return `✅ 正在随机播放: ${path.basename(resolved)} (共 ${audioFiles.length} 首音频)`
  } catch (error: any) {
    return `❌ 播放失败: ${error.message}`
  }
}

export async function loopSong(filePath: string): Promise<string> {
  try {
    const resolved = validatePath(filePath)
    if (!fs.existsSync(resolved)) {
      return `❌ 文件不存在: ${filePath}`
    }
    if (!isAudioFile(resolved)) {
      return `❌ 不是支持的音频文件: ${path.extname(resolved)}`
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const command = `start /b mpv --no-video --loop=inf "${resolved}"`
    exec(command)
    return `✅ 正在单曲循环: ${path.basename(resolved)}`
  } catch (error: any) {
    return `❌ 播放失败: ${error.message}`
  }
}

export async function loopFolder(folderPath: string): Promise<string> {
  try {
    const resolved = validatePath(folderPath)
    if (!fs.existsSync(resolved)) {
      return `❌ 文件夹不存在: ${folderPath}`
    }
    const stat = fs.statSync(resolved)
    if (!stat.isDirectory()) {
      return `❌ 路径不是文件夹: ${folderPath}`
    }
    const audioFiles = getAudioFilesInDir(resolved)
    if (audioFiles.length === 0) {
      return `❌ 文件夹中没有音频文件: ${folderPath}`
    }
    try { await execAsync('taskkill /f /im mpv.exe') } catch {}
    const command = `start /b mpv --no-video --loop-playlist=inf "${resolved}"`
    exec(command)
    return `✅ 正在列表循环: ${path.basename(resolved)} (共 ${audioFiles.length} 首音频)`
  } catch (error: any) {
    return `❌ 播放失败: ${error.message}`
  }
}

export async function stopMusic(): Promise<string> {
  try {
    await execAsync('taskkill /f /im mpv.exe')
    return '✅ 音乐已停止。'
  } catch {
    return 'ℹ️ 当前没有正在播放的音乐。'
  }
}
