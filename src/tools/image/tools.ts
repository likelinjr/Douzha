import fs from 'fs/promises'
import path from 'path'
import { ToolResult } from '../../types/tool.js'
import { validatePath } from '../../utils/security.js'

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'])

const MIME_MAP: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
}

export async function imageToBase64(args: { path: string }): Promise<ToolResult> {
  try {
    const resolvedPath = validatePath(args.path)
    const ext = path.extname(resolvedPath).toLowerCase()

    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return {
        content: [{ type: "text", text: `不支持的图片格式: ${ext}，支持: ${[...SUPPORTED_EXTENSIONS].join(', ')}` }],
        isError: true
      }
    }

    const buffer = await fs.readFile(resolvedPath)
    const base64 = buffer.toString('base64')
    const mimeType = MIME_MAP[ext]

    return {
      content: [{ type: "image", data: base64, mimeType }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `图片转换失败: ${message}` }],
      isError: true
    }
  }
}

console.log( JSON.stringify(await imageToBase64({ path: '/Doza/Photos/1784296309340.png' })).length )
