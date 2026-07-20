import * as weatherTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const weather_toolHandlers: ToolHandlers = {
  'get_24hours_weather': (args) => weatherTools.get24HoursWeather(args.city),
  'get_72hours_weather': (args) => weatherTools.get72HoursWeather(args.city),
  'get_3days_weather': (args) => weatherTools.get3DaysWeather(args.city),
  'get_7days_weather': (args) => weatherTools.get7DaysWeather(args.city),
  'get_air_quality': (args) => weatherTools.getAirQuality(args.city),
  'get_weather_warning': (args) => weatherTools.getWeatherWarning(args.city),
}