import { inspect } from 'node:util'
import { RESET, TOOL_COLOR, COMMON_COLOR } from "../config/themes/colors.js"

export const DEBUG = process.env.DEBUG === 'true'

function formatArgs(args: any[]): string {
  return args.map(arg =>
    typeof arg === 'string' ? arg : inspect(arg, { depth: 2, colors: false })
  ).join('')
}

export function toolLog(...args: any[]): void {
  if (!DEBUG) return
  console.log(`${TOOL_COLOR}${formatArgs(args)}${RESET}`)
}

export function commonLog(...args: any[]): void {
  if (!DEBUG) return
  console.log(`${COMMON_COLOR}${formatArgs(args)}${RESET}`)
}

export function Log(color?: string, ...args: any[]): void {
  if (!DEBUG) return
  console.log(`${color || RESET}${formatArgs(args)}${RESET}`)
}