import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const SANDBOX_DIR = path.resolve(ROOT_DIR, 'sandbox')

export function validatePath(inputPath: string): string {
  let cleanedPath = inputPath.replace(/['"]/g, '').trim()

  if (cleanedPath.startsWith('sandbox/')) {
    cleanedPath = cleanedPath.replace('sandbox/', '')
  } else if (cleanedPath === 'sandbox') {
    cleanedPath = '.'
  }
    
  const resolvedPath = path.resolve(SANDBOX_DIR, cleanedPath)
  if (!resolvedPath.startsWith(SANDBOX_DIR)) {
    throw new Error(`🚫 安全警报：AI 尝试访问非法路径 [${resolvedPath}]`)
  }
  return resolvedPath
}