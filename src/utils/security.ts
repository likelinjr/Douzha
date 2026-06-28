import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../../')
const WORKING_DIR = path.resolve(ROOT_DIR, 'workingDirectory')
const DESKTOP_DIR = path.resolve(WORKING_DIR, 'DeskTop')

export function validatePath(inputPath: string): string {
  let cleanedPath = inputPath.replace(/['"]/g, '').trim()
  if (cleanedPath.startsWith('workingDirectory/')) {
    cleanedPath = cleanedPath.replace('workingDirectory/', '')
  } else if (cleanedPath === 'workingDirectory') {
    cleanedPath = '.'
  }
  const resolvedPath = path.resolve(WORKING_DIR, cleanedPath)
  if (!resolvedPath.startsWith(WORKING_DIR)) {
    throw new Error(`🚫 安全警报：访问非法路径 [${resolvedPath}]`)
  }
  return resolvedPath
}

export function checkWritePermission(targetPath: string): boolean {
  return targetPath.startsWith(DESKTOP_DIR)
}