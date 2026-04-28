import fs from 'fs/promises'
import { validatePath } from '../../utils/security.js'
import path from 'path'

export async function readFile(path: string): Promise<string> {
  try {
    const safePath = validatePath(path)
    const content = await fs.readFile(safePath, 'utf-8')
    return content
  } catch (error: any) {
    return `❌ 读取失败: ${error.message}`
  }
}

export async function writeFile(filePath: string, content: string): Promise<string> {
  try {
    const safePath = validatePath(filePath)
    const dir = path.dirname(safePath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(safePath, content, 'utf-8')
    return `✅ 成功写入文件: ${filePath}`
  } catch (error: any) {
    return `❌ 写入失败: ${error.message}`
  }
}

export async function listFiles(dirPath: string = "."): Promise<string> {
  try {
    const safePath = validatePath(dirPath)
    const files = await fs.readdir(safePath)
    return `目录 [${dirPath}] 下的文件: ${files.join(', ')}`
  } catch (error: any) {
    return `❌ 获取列表失败: ${error.message}`
  }
}

export async function deleteFile(filePath: string): Promise<string> {
  try {
    const safePath = validatePath(filePath)
    await fs.unlink(safePath)
    return `✅ 成功删除文件: ${filePath}`
  } catch (error: any) {
    return `❌ 删除失败: ${error.message}`
  }
}

export async function copyFile(source: string, destination: string): Promise<string> {
  try {
    const safeSource = validatePath(source)
    const safeDest = validatePath(destination)
    await fs.copyFile(safeSource, safeDest)
    return `✅ 成功从 [${source}] 复制到 [${destination}]`
  } catch (error: any) {
    return `❌ 复制失败: ${error.message}`
  }
}

export async function editFile(filePath: string, oldText: string, newText: string): Promise<string> {
  try {
    const safePath = validatePath(filePath) 
    const content = await fs.readFile(safePath, 'utf-8')

    const parts = content.split(oldText)
    const count = parts.length - 1

    if (count === 0) {
      return `❌ 替换失败：在文件中没找到这段内容。请检查文字、空格或缩进是否完全一致。`
    }
    if (count > 1) {
      return `❌ 替换失败：文中出现了 ${count} 处相同内容。请提供更长的一段文字以确保定位唯一。`
    }
    const updatedContent = content.replace(oldText, newText)
    await fs.writeFile(safePath, updatedContent, 'utf-8')
    return `✅ 文件 ${filePath} 已完成局部修改。`
  } catch (error: any) {
    return `❌ 修改出错: ${error.message}`
  }
}