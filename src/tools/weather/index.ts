import * as weatherTools from './tools.js'

export const weather_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'get_weather': (args) => weatherTools.getWeather(args.city),
}