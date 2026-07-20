import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { sanitizePaths } from '../../utils/security.js'
import { ToolResult } from '../../types/tool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOWNLOAD_DIR = path.resolve(__dirname, '../../../Doza/Downloads')

export async function downloadFile(url: string, filename?: string): Promise<ToolResult> {
  try {
    await fs.mkdir(DOWNLOAD_DIR, { recursive: true })
    if (!filename) {
      try {
        const urlObj = new URL(url)
        const pathname = urlObj.pathname
        const extracted = pathname.split('/').pop() || 'download'
        filename = extracted.includes('.') ? extracted : `${extracted}.bin`
      } catch {
        filename = 'download.bin'
      }
    }
    const safeName = filename.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fff]/g, '_')
    const savePath = path.join(DOWNLOAD_DIR, safeName)
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HachiwareBot/1.0)' },
      redirect: 'follow'
    })
    if (!response.ok) {
      return {
        content: [{ type: "text", text: `下载失败: HTTP ${response.status} ${response.statusText}` }],
        isError: true
      }
    }
    const contentLength = response.headers.get('content-length')
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2)
    await fs.writeFile(savePath, buffer)
    const relativePath = `/Doza/Downloads/${safeName}`
    return {
      content: [{ type: "text", text: (
        `文件下载成功\n` +
        `保存路径: ${relativePath}\n` +
        `文件名: ${safeName}\n` +
        `文件大小: ${sizeMB} MB (${buffer.length.toLocaleString()} 字节)\n` +
        `${contentLength ? `原始大小: ${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)} MB` : ''}`
      ) }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`下载失败: ${message}`) }],
      isError: true
    }
  }
}
