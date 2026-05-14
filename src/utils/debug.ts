import { RESET, TOOL_COLOR, COMMON_COLOR } from "../config/theme.js"

export const DEBUG = process.env.DEBUG === 'true'

export function toolLog(...args: any[]): void {
  if (process.env.DEBUG === 'true') {
    console.log(TOOL_COLOR, ...args, RESET)
  }
}
export function commonLog(...args: any[]): void {
  if (process.env.DEBUG === 'true') {
    console.log(COMMON_COLOR, ...args, RESET)
  }
}