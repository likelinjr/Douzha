import { execFile } from 'child_process'
import { promisify } from 'util'
import { validatePath } from '../../utils/security.js'

const execFilePromise = promisify(execFile)
function smartDecode(buf: Buffer | null | undefined): string {
  if (!buf || buf.length === 0) return ""
  if (process.platform !== 'win32') {
    return new TextDecoder('utf-8').decode(buf)
  }
  try {
    const utf8Decoder = new TextDecoder('utf-8', { fatal: true })
    return utf8Decoder.decode(buf)
  } catch {
    const gbkDecoder = new TextDecoder('gbk')
    return gbkDecoder.decode(buf)
  }
}

export async function executeCommand(file: string, args: string[] = [], cwd: string = "."): Promise<string> {
  try {
    const safeCwd = validatePath(cwd)
    const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
    const { stdout, stderr } = await execFilePromise(file, args, {
      cwd: safeCwd,
      encoding: 'buffer',
      timeout: 30000,
      env
    })
    const result = smartDecode(stdout)
    const errResult = smartDecode(stderr)
    return result.trim() || (errResult ? `[警告/错误输出]: ${errResult}` : "✅执行成功")
  } catch (error: any) {
    if (error.stderr && error.stderr.length > 0) {
      return `❌ 执行失败: ${smartDecode(error.stderr).trim()}`
    }
    return `❌ 执行失败: ${error.message.trim()}`
  }
}

// const searchKeyword = "不重逢"
// const args = [
//   '--cookies', 'www.bilibili.com_cookies.txt',
//   '--add-header', 'Referer:https://www.bilibili.com',
//   '--print', '%(index)d. [%(id)s] %(title)s | 播放量: %(view_count)s | 时长: %(duration_string)s',
//   `bilisearch5:${searchKeyword}`
// ]
// async function getBiliList() {
//   const result = await executeCommand('yt-dlp', args, ".")
//   console.log("搜索结果：\n", result)
//   return result
// }
// getBiliList()