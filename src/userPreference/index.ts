import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname

export function getUserInfo(): string {
  try {
    const userInfoPath = path.join(__dirname, 'user_info.md')
    const content = fs.readFileSync(userInfoPath, 'utf-8')
    return content.trim() || '暂无用户信息'
  } catch {
    return '暂无用户信息'
  }
}
