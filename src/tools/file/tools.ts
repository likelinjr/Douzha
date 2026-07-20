import fs from 'fs/promises'
import { validatePath, checkWritePermission, sanitizePaths } from '../../utils/security.js'
import { fileURLToPath } from 'url'
import path from 'path'
import fsSync from 'fs'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'
import AdmZip from 'adm-zip'
import { ToolResult } from '../../types/tool.js'
import * as tar from 'tar'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WORKSPACE_DIR = path.resolve(__dirname, '../../../Doza/Workspace')
const ROOT_DIR = path.resolve(__dirname, '../../../')
const HOME_DIR = path.resolve(ROOT_DIR, 'Doza')

export async function readFile(filePath: string): Promise<ToolResult> {
  try {
    const safePath = validatePath(filePath)
    const content = await fs.readFile(safePath, 'utf-8')
    return {
      content: [{
        type: "text",
        text: content
      }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{
        type: "text",
        text: sanitizePaths(`读取失败: ${message}`)
      }],
      isError: true
    }
  }
}

export async function writeFile(filePath: string, content: string): Promise<ToolResult> {
  try {
    const safePath = validatePath(filePath)
    if (!checkWritePermission(safePath)) {
      return {
        content: [{ type: "text", text: `只能在 /Doza/Workspace 目录中进行写入操作` }],
        isError: true
      }
    }
    const dir = path.dirname(safePath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(safePath, content, 'utf-8')
    return {
      content: [{ type: "text", text: `成功写入文件: ${filePath}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`写入失败: ${message}`) }],
      isError: true
    }
  }
}

export async function listFiles(dirPath: string = "/Doza/Workspace"): Promise<ToolResult> {
  try {
    const safePath = validatePath(dirPath)
    const entries = await fs.readdir(safePath, { withFileTypes: true })
    const formattedEntries = entries.map(entry => {
      if (entry.isDirectory()) {
        return `${entry.name}/`
      }
      return entry.name
    })
    return {
      content: [{ type: "text", text: `目录 [${dirPath}] 下的文件或文件夹: ${formattedEntries.join(', ')}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`获取列表失败: ${message}`) }],
      isError: true
    }
  }
}

export async function deleteFile(filePath: string): Promise<ToolResult> {
  try {
    const safePath = validatePath(filePath)
    if (!checkWritePermission(safePath)) {
      return {
        content: [{ type: "text", text: `只能在 /Doza/Workspace 目录中进行删除操作` }],
        isError: true
      }
    }
    await fs.unlink(safePath)
    return {
      content: [{ type: "text", text: `成功删除文件: ${filePath}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`删除失败: ${message}`) }],
      isError: true
    }
  }
}

export async function copyFile(source: string, destination: string): Promise<ToolResult> {
  try {
    const safeSource = validatePath(source)
    const safeDest = validatePath(destination)
    if (!checkWritePermission(safeDest)) {
      return {
        content: [{ type: "text", text: `只能将文件复制到 /Doza/Workspace 目录中` }],
        isError: true
      }
    }
    await fs.copyFile(safeSource, safeDest)
    return {
      content: [{ type: "text", text: `成功从 [${source}] 复制到 [${destination}]` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`复制失败: ${message}`) }],
      isError: true
    }
  }
}

export async function editFile(filePath: string, oldText: string, newText: string): Promise<ToolResult> {
  try {
    const safePath = validatePath(filePath)
    if (!checkWritePermission(safePath)) {
      return {
        content: [{ type: "text", text: `只能在 /Doza/Workspace 目录中进行编辑操作` }],
        isError: true
      }
    }
    const content = await fs.readFile(safePath, 'utf-8')
    const parts = content.split(oldText)
    const count = parts.length - 1
    if (count === 0) {
      return {
        content: [{ type: "text", text: `替换失败: 在文件中没找到这段内容。请检查文字、空格或缩进是否完全一致` }],
        isError: true
      }
    }
    if (count > 1) {
      return {
        content: [{ type: "text", text: `替换失败: 文中出现了 ${count} 处相同内容。请提供更长的一段文字以确保定位唯一` }],
        isError: true
      }
    }
    const updatedContent = content.replace(oldText, newText)
    await fs.writeFile(safePath, updatedContent, 'utf-8')
    return {
      content: [{ type: "text", text: `文件 ${filePath} 已完成局部修改` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`修改出错: ${message}`) }],
      isError: true
    }
  }
}

async function buildTree(dirPath: string, prefix: string = "", isLast: boolean = true): Promise<string> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  let result = ""
  const connector = isLast ? "└── " : "├── "
  const extension = isLast ? "    " : "│   "
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    const isLastEntry = i === entries.length - 1
    const entryPrefix = prefix + connector
    const childPrefix = prefix + extension
    result += `${entryPrefix}${entry.name}\n`
    if (entry.isDirectory()) {
      const subDirPath = path.join(dirPath, entry.name)
      result += await buildTree(subDirPath, childPrefix, isLastEntry)
    }
  }
  return result
}

export async function getDirectoryTree(dirPath: string = "/Doza"): Promise<ToolResult> {
  try {
    const safePath = validatePath(dirPath)
    const stats = await fs.stat(safePath)
    if (!stats.isDirectory()) {
      return {
        content: [{ type: "text", text: `路径不是目录: ${dirPath}` }],
        isError: true
      }
    }
    const tree = await buildTree(safePath)
    return {
      content: [{ type: "text", text: `目录 [${dirPath}] 的文件结构树:\n${(tree || "空目录").trimEnd()}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`获取目录结构失败: ${message}`) }],
      isError: true
    }
  }
}

export async function getDirectoryTreeSelf(dirPath: string): Promise<string> {
  try {
    const resolvedPath = path.resolve(HOME_DIR,dirPath)
    const stats = await fs.stat(resolvedPath)
    if (!stats.isDirectory()) {
      return `路径不是目录: ${dirPath}`
    }
    const tree = await buildTree(resolvedPath)
    return `📁 目录 [${dirPath}] 的文件结构树:\n${(tree || "空目录").trimEnd()}`
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return `获取目录结构失败: ${message}`
  }
}

export async function extractFile(filepath: string, outputDir?: string): Promise<ToolResult> {
  try {
    const resolvedPath = validatePath(filepath)
    if (!fsSync.existsSync(resolvedPath)) {
      return {
        content: [{ type: "text", text: sanitizePaths(`文件不存在: ${resolvedPath}`) }],
        isError: true
      }
    }
    const stat = await fs.stat(resolvedPath)
    if (!stat.isFile()) {
      return {
        content: [{ type: "text", text: sanitizePaths(`路径不是文件: ${sanitizePaths(resolvedPath)}`) }],
        isError: true
      }
    }
    const ext = path.extname(resolvedPath).toLowerCase()
    const basename = path.basename(resolvedPath)
    const nameWithoutExt = path.parse(basename).name

    // 确定父目录，校验写入权限
    let baseDir = WORKSPACE_DIR
    if (outputDir) {
      baseDir = validatePath(outputDir)
      if (!checkWritePermission(baseDir)) {
        return {
          content: [{ type: "text", text: sanitizePaths(`无权解压到该目录 [${baseDir}]`) }],
          isError: true
        }
      }
    }

    // 拼接解压目录
    let finalOutputDir = path.join(baseDir, nameWithoutExt)
    let counter = 1
    while (fsSync.existsSync(finalOutputDir)) {
      finalOutputDir = path.join(baseDir, `${nameWithoutExt}(${counter})`)
      counter++
    }
    await fs.mkdir(finalOutputDir, { recursive: true })

    if (ext === '.zip') {
      const zip = new AdmZip(resolvedPath)
      zip.extractAllTo(finalOutputDir, true)
    } else if (ext === '.tar' || ext === '.gz' && basename.includes('.tar')) {
      await tar.x({
        file: resolvedPath,
        cwd: finalOutputDir
      })
    } else if ((ext === '.gz' || ext === '.tgz') && !basename.includes('.tar')) {
      const outName = nameWithoutExt + (ext === '.tgz' ? '' : path.extname(nameWithoutExt) || '')
      const outPath = path.join(finalOutputDir, outName || 'output')
      await pipeline(
        createReadStream(resolvedPath),
        createGunzip(),
        createWriteStream(outPath)
      )
    } else {
      return {
        content: [{ type: "text", text: `不支持的压缩格式: ${ext}（支持 .zip、.tar、.tar.gz、.tgz、.gz）` }],
        isError: true
      }
    }
    return {
      content: [{ type: "text", text: sanitizePaths(
        `解压成功\n` +
        `源文件: ${resolvedPath}\n` +
        `输出目录: ${finalOutputDir}`) }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`解压失败: ${message}`) }],
      isError: true
    }
  }
}