import { inspect } from 'node:util'
import { DEV_RESET, DEV_TOOL_COLOR, DEV_COMMON_COLOR, DEV_REASONING_COLOR, getDevColor } from "../config/themes/colors.js"

export const DEBUG = () => process.env.DEBUG === 'true'

function formatArgs(args: any[]): string {
  return args.map(arg =>
    typeof arg === 'string' ? arg : inspect(arg, { depth: 2, colors: false })
  ).join(' ')
}

export function toolLog(...args: any[]): void {
  if (!DEBUG()) return
  process.stdout.write(`${DEV_TOOL_COLOR}${formatArgs(args)}${DEV_RESET}`)
}
export function commonLog(...args: any[]): void {
  if (!DEBUG()) return
  process.stdout.write(`${DEV_COMMON_COLOR}${formatArgs(args)}${DEV_RESET}`)
}
export function errorLog(...args: any[]): void {
  if (!DEBUG()) return
  process.stdout.write(`${getDevColor('APPLE_RED')}${formatArgs(args)}${DEV_RESET}`)
}
export function warnLog(...args: any[]): void {
  if (!DEBUG()) return
  process.stdout.write(`${getDevColor('ORANGE')}${formatArgs(args)}${DEV_RESET}`)
}
export function Log(color?: string, ...args: any[]): void {
  if (!DEBUG()) return
  process.stdout.write(`${color || DEV_RESET}${formatArgs(args)}${DEV_RESET}`)
}
export function model_reasoning(reasoning: string): void {
  if (!DEBUG()) return
  process.stdout.write(`${DEV_REASONING_COLOR}${reasoning}${DEV_RESET}`)
}
export function model_content(content: string): void {
  if (!DEBUG()) return
  process.stdout.write(`${DEV_RESET}${content}${DEV_RESET}`)
}

// toolLog('\n✅ 测试字符串输出')
// toolLog('\n✅ 测试对象:', { name: 'Douzha', version: '1.0', features: ['AI', 'Agent'] })
// commonLog('\n✅ 测试数组:', [1, 2, 3, 4, 5])
// commonLog('\n✅ 测试多参数:', '步骤1', '步骤2', '步骤3', '完成')
// const complexData = {
//   user: { id: 123, name: 'like' },
//   tasks: [
//     { id: 1, status: 'done' },
//     { id: 2, status: 'pending' }
//   ],
//   metadata: { count: 10, success: true }
// }
// toolLog('\n✅ 测试复杂数据:', complexData)
// commonLog('\n\n✅ 双换行（重要信息）')
// commonLog('\n✅ 单换行（普通信息）')
// commonLog('✅ 无换行（紧凑输出）')

// export function toolLog(...args: any[]): void {
//   if (!DEBUG) return
//   console.log(`${TOOL_COLOR}${formatArgs(args)}${RESET}`)
// }
// export function commonLog(...args: any[]): void {
//   if (!DEBUG) return
//   console.log(`${COMMON_COLOR}${formatArgs(args)}${RESET}`)
// }
// export function Log(color?: string, ...args: any[]): void {
//   if (!DEBUG) return
//   console.log(`${color || RESET}${formatArgs(args)}${RESET}`)
// }