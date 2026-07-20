
import { ToolResult } from '../../types/tool.js'

export async function getCurrentTime(): Promise<ToolResult> {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hour = now.getHours().toString().padStart(2, '0')
  const minute = now.getMinutes().toString().padStart(2, '0')
  const second = now.getSeconds().toString().padStart(2, '0')
  const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]
  const offset = -now.getTimezoneOffset()
  const offsetHours = Math.floor(Math.abs(offset) / 60)
  const offsetMinutes = Math.abs(offset) % 60
  const offsetSign = offset >= 0 ? '+' : '-'
  const timezone = `UTC${offsetSign}${offsetHours}${offsetMinutes > 0 ? ':' + offsetMinutes.toString().padStart(2, '0') : ''}`
  return {
    content: [{ type: "text", text: `${year}-${month}-${day} ${hour}:${minute}:${second} ${weekday} (${timezone})` }],
    isError: false
  }
}