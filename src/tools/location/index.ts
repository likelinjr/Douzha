import * as locationTools from './tools.js'

export const location_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'get_user_location': () => locationTools.getUserLocation(),
}