import fss from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { commonLog, Log } from '../utils/debug.js'
import { COLORS } from '../config/themes/colors.js'
import { get24HoursWeather, get3DaysWeather } from '../tools/weather/tools.js'
import { loadMemory, getRecentContext, getLatestFullContext } from '../utils/memory.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const WORKING_DIR = path.resolve(ROOT_DIR, 'workingDirectory')

const DEFAULT_FOLDERS = ['DeskTop', 'Documents', 'Downloads', 'Music', 'Photos']

function initWorkingDirectory() {
  const createdFolders: string[] = []
  if (!fss.existsSync(WORKING_DIR)) {
    fss.mkdirSync(WORKING_DIR, { recursive: true })
    createdFolders.push('workingDirectory')
  }
  for (const folder of DEFAULT_FOLDERS) {
    const folderPath = path.join(WORKING_DIR, folder)
    if (!fss.existsSync(folderPath)) {
      fss.mkdirSync(folderPath, { recursive: true })
      createdFolders.push(folder)
    }
  }
  if (createdFolders.length > 0) {
    commonLog(`📁 工作目录初始化完成，已创建：${createdFolders.join(', ')}`)
  } else {
    commonLog('📁 工作目录已存在')
  }
}
initWorkingDirectory()

function compactPreview(text: string, headLines: number = 3, tailLines: number = 2): string {
  const lines = text.split('\n')
  if (lines.length <= headLines + tailLines) return text
  const head = lines.slice(0, headLines)
  const tail = lines.slice(-tailLines)
  return [...head, `...[省略 ${lines.length - headLines - tailLines} 行]...`, ...tail].join('\n')
}

const get24HoursWeather_result = await get24HoursWeather('广州')
Log(COLORS.SLATE, "\n", compactPreview(get24HoursWeather_result))

const get3DaysWeather_result = await get3DaysWeather('广州')
Log(COLORS.MAUVE, "\n", compactPreview(get3DaysWeather_result))

// const getAirQuality_result = await getAirQuality('广州')
// commonLog("\n",compactPreview(getAirQuality_result))

// const getWeatherWarning_result = await getWeatherWarning('广州')
// commonLog("\n",compactPreview(getWeatherWarning_result))

const loadMemory_result = await loadMemory()
Log(COLORS.PLUM, "\n", loadMemory_result)

const getRecentContext_result = await getRecentContext()
commonLog("\n", "最近对话长度", getRecentContext_result.length)
Log(COLORS.TERRACOTTA, "\n",getRecentContext_result)

const latestFullContext_result = await getLatestFullContext()
commonLog("\n", "当前对话完整上下文长度", latestFullContext_result.length)
Log(COLORS.AMBER, "\n",latestFullContext_result)