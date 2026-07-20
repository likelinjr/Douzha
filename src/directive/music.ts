import { Directive, DirectiveContext } from '../types/directive.js'
import {
  playSong,
  playFolder,
  stopMusic,
} from '../tools/music/tools.js'
import fs from 'fs'
import path from 'path'

const MUSIC_DIR = path.resolve(process.cwd(), 'workingDirectory/Music')

function findFile(name: string): string | null {
  if (!fs.existsSync(MUSIC_DIR)) return null
  function search(dir: string): string | null {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isFile()) {
        const baseName = path.parse(entry.name).name
        if (baseName === name || entry.name === name) return fullPath
      }
      if (entry.isDirectory()) {
        const found = search(fullPath)
        if (found) return found
      }
    }
    return null
  }
  return search(MUSIC_DIR)
}

function findDir(name: string): string | null {
  if (!fs.existsSync(MUSIC_DIR)) return null
  function search(dir: string): string | null {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory() && entry.name === name) return fullPath
    }
    return null
  }
  return search(MUSIC_DIR)
}

async function execute(context: DirectiveContext): Promise<void> {
  const args = context.args
  if (args.length === 0) {
    console.log(`  用法: /music <选项> [名称]`)
    console.log('  /music -file [文件名]   播放指定音频文件')
    console.log('  /music -dir [文件夹名]   播放文件夹内所有音频')
    console.log('  /music -file -loop [文件名]   单曲循环播放')
    console.log('  /music -dir -loop [文件夹名]   列表循环播放')
    console.log('  /music -stop   停止播放')
    return
  }
  if (args[0] === '-s' || args[0] === '-stop') {
    const result = await stopMusic()
    console.log(result)
    return
  }
  const hasLoop = args.includes('-l') || args.includes('-loop')
  const cleanArgs = args.filter(a => a !== '-l' && a !== '-loop')
  const mode = cleanArgs[0]?.toLowerCase()
  const name = cleanArgs.slice(1).join(' ')
  if (!name) {
    console.log('❌ 请指定文件名或文件夹名')
    return
  }
  switch (mode) {
    case '-f':
    case '-file': {
      const filePath = findFile(name)
      if (!filePath) {
        console.log(`❌ 未找到文件: ${name}`)
        return
      }
      const result = await playSong(filePath, hasLoop)
      console.log(result)
      break
    }
    case '-d':
    case '-dir': {
      const dirPath = findDir(name)
      if (!dirPath) {
        console.log(`❌ 未找到文件夹: ${name}`)
        return
      }
      const result = await playFolder(dirPath, hasLoop)
      console.log(result)
      break
    }
    default:
      console.log(`❌ 未知选项: ${mode}，输入 /music 查看帮助`)
  }
}

export const music: Directive = {
  description: '播放音乐',
  usage: '/music <-file|-dir> [-l/-loop] [名称]',
  execute
}
