import { Directive, DirectiveContext } from '../types/directive.js'
import {
  getHoursWeather,
  getDaysWeather,
  getAirQuality,
  getWeatherWarning,
} from '../tools/weather/tools.js'

const DEFAULT_CITY = '广州'

function parseCity(args: string[]): string {
  if (args.length === 0) return DEFAULT_CITY
  return args[args.length - 1]
}

async function execute(context: DirectiveContext): Promise<void> {
  const args = context.args
  if (args.length === 0) {
    console.log(`  用法: /weather -<hour|dir|air|warn> [参数] [城市]`)
    console.log('  /weather -hour 24/72 [城市]   逐小时预报(24/72小时)')
    console.log('  /weather -dir 3/7  [城市]   每日预报(3/7天)')
    console.log('  /weather -air [城市]   空气质量')
    console.log('  /weather -warn [城市]   天气预警')
    return
  }
  const subCmd = args[0]?.toLowerCase()
  const restArgs = args.slice(1)
  switch (subCmd) {
    case '-h':
    case '-hour': {
      const hours = parseInt(restArgs[0]) || 24
      const city = parseCity(restArgs.length > 1 ? restArgs.slice(1) : [])
      if (![24, 72].includes(hours)) {
        console.log('❌ 小时数仅支持 24 或 72')
        return
      }
      const result = await getHoursWeather(city, hours)
      console.log(result)
      break
    }
    case '-d':
    case '-day': {
      const days = parseInt(restArgs[0]) || 3
      const city = parseCity(restArgs.length > 1 ? restArgs.slice(1) : [])
      if (![3, 7].includes(days)) {
        console.log('❌ 天数仅支持 3 或 7')
        return
      }
      const result = await getDaysWeather(city, days)
      console.log(result)
      console.log('')
      break
    }
    case '-a':
    case '-air': {
      const city = parseCity(restArgs)
      const result = await getAirQuality(city)
      console.log(result)
      break
    }
    case '-w':
    case '-warn': {
      const city = parseCity(restArgs)
      const result = await getWeatherWarning(city)
      console.log(result)
      break
    }
    default:
      console.log(`❌ 输入 /weather 查看帮助`)
  }
}

export const weather: Directive = {
  description: '查询天气',
  usage: '/weather -<hour|dir|air|warn> [参数] [城市]',
  execute
}
