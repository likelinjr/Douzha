import fss from 'fs'
import path from 'path'
import { commonLog, Log } from '../utils/debug.js'
import { getDevColor } from '../config/themes/colors.js'
import { get24HoursWeather, get3DaysWeather, getAirQuality } from '../tools/weather/tools.js'
import { loadMemory, getRecentContext, getLatestFullContext } from '../utils/memory.js'
import { getSkillsPrompt } from '../skills/prompt.js'
import { executeCommand } from '../tools/command/tools.js'
import { executeSkill } from '../tools/skill/tools.js'
import { getSystemPrompt } from '../brain/prompt.js'
import { downloadFile } from '../tools/download/tools.js'
// import '../tools/file/test.js'
import { initializeMCP } from '../mcp/index.js'

const __dirname = import.meta.dirname
const ROOT_DIR = path.resolve(__dirname, '../../')
const HOME_DIR = path.resolve(ROOT_DIR, 'Doza')
const DEFAULT_FOLDERS = ['Workspace', 'Documents', 'Downloads', 'Music', 'Photos']

function initHomeDirectory() {
  const createdFolders: string[] = []
  if (!fss.existsSync(HOME_DIR)) {
    fss.mkdirSync(HOME_DIR, { recursive: true })
    createdFolders.push('Doza')
  }
  for (const folder of DEFAULT_FOLDERS) {
    const folderPath = path.join(HOME_DIR, folder)
    if (!fss.existsSync(folderPath)) {
      fss.mkdirSync(folderPath, { recursive: true })
      createdFolders.push(folder)
    }
  }
  if (createdFolders.length > 0) {
    commonLog(`\n📁 Doza 目录初始化完成，已创建：${createdFolders.join(', ')}`)
  } else {
    commonLog('\n📁 Doza 目录已存在')
  }
}
initHomeDirectory()
await initializeMCP()

function compactPreview(text: string, headLines: number = 3, tailLines: number = 2): string {
  const lines = text.split('\n')
  if (lines.length <= headLines + tailLines) return text
  const head = lines.slice(0, headLines)
  const tail = lines.slice(-tailLines)
  return [...head, `...[省略 ${lines.length - headLines - tailLines} 行]...`, ...tail].join('\n')
}

// const get24HoursWeather_result = await get24HoursWeather('广州')
// Log(COLORS.SLATE, "\n\n" + compactPreview(get24HoursWeather_result))

// const get3DaysWeather_result = await get3DaysWeather('广州')
// Log(COLORS.MAUVE, "\n", compactPreview(get3DaysWeather_result))

// const getAirQuality_result = await getAirQuality('广州')
// commonLog("\n\n" + compactPreview(getAirQuality_result))

// const getWeatherWarning_result = await getWeatherWarning('广州')
// commonLog("\n",compactPreview(getWeatherWarning_result))

// const loadMemory_result = await loadMemory()
// Log(COLORS.PLUM, "\n", loadMemory_result)

// const getRecentContext_result = await getRecentContext()
// commonLog("\n\n最近对话长度" + getRecentContext_result.length)
// Log(COLORS.TERRACOTTA, "\n\n" + getRecentContext_result)

const latestFullContext_result = await getLatestFullContext()
commonLog("\n\n当前对话完整上下文长度", latestFullContext_result.length)
Log(getDevColor('AMBER'), "\n\n"+latestFullContext_result)

// commonLog(getSkillsPrompt())
// commonLog(await executeSkill('pdf'))
// commonLog(await executeCommand('python /Doza/Workspace/hello.py'))
// commonLog(await executeCommand('python /Skills/hello.py'))

// console.log(getSystemPrompt())

// https://www.anime-chiikawa.jp/images/bg_foot_chiikawa.png
// console.log(await downloadFile('https://www.anime-chiikawa.jp/images/bg_top_chiikawa_01.png','chikawa.png'))
