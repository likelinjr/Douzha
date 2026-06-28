import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { createReadStream, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'
import { fileURLToPath } from 'url'
import AdmZip from 'adm-zip'
import * as tar from 'tar'
import { validatePath } from '../../utils/security.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SANDBOX_DIR = path.resolve(__dirname, '../../../sandbox')

async function listDir(dir: string, base: string = dir): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const results: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const relative = path.relative(base, full)
    if (entry.isDirectory()) {
      results.push(`📁 ${relative}/`)
      results.push(...(await listDir(full, base)))
    } else {
      const stat = await fs.stat(full)
      const sizeKB = (stat.size / 1024).toFixed(1)
      results.push(`📄 ${relative} (${sizeKB} KB)`)
    }
  }
  return results
}

export async function extractFile(filepath: string, outputDir?: string): Promise<string> {
  try {
    const resolvedPath = validatePath(filepath)
    if (!fsSync.existsSync(resolvedPath)) {
      return `❌ 文件不存在: ${resolvedPath}`
    }
    const stat = await fs.stat(resolvedPath)
    if (!stat.isFile()) {
      return `❌ 路径不是文件: ${resolvedPath}`
    }
    const ext = path.extname(resolvedPath).toLowerCase()
    const basename = path.basename(resolvedPath)
    const nameWithoutExt = path.parse(basename).name
    if (!outputDir) {
      outputDir = path.join(SANDBOX_DIR, nameWithoutExt + '_extracted')
    } else {
      outputDir = path.resolve(outputDir)
      if (!outputDir.startsWith(SANDBOX_DIR)) {
        outputDir = path.join(SANDBOX_DIR, path.basename(outputDir))
      }
    }
    await fs.mkdir(SANDBOX_DIR, { recursive: true })
    await fs.mkdir(outputDir, { recursive: true })
    if (ext === '.zip') {
      const zip = new AdmZip(resolvedPath)
      zip.extractAllTo(outputDir, true)
    } else if (ext === '.tar' || ext === '.gz' && basename.includes('.tar')) {
      await tar.x({
        file: resolvedPath,
        cwd: outputDir
      })
    } else if ((ext === '.gz' || ext === '.tgz') && !basename.includes('.tar')) {
      const outName = nameWithoutExt + (ext === '.tgz' ? '' : path.extname(nameWithoutExt) || '')
      const outPath = path.join(outputDir, outName || 'output')
      await pipeline(
        createReadStream(resolvedPath),
        createGunzip(),
        createWriteStream(outPath)
      )
    } else {
      return `❌ 不支持的压缩格式: ${ext}（支持 .zip、.tar、.tar.gz、.tgz、.gz）`
    }
    const files = await listDir(outputDir)
    const totalFiles = files.filter(f => f.startsWith('📄')).length
    const totalDirs = files.filter(f => f.startsWith('📁')).length
    return (
      `✅ 解压成功\n` +
      `📦 源文件: ${resolvedPath}\n` +
      `📂 输出目录: ${outputDir}\n` +
      `📊 文件数: ${totalFiles} 个文件, ${totalDirs} 个文件夹\n\n` +
      `📋 文件列表:\n${files.slice(0, 50).join('\n')}${files.length > 50 ? `\n... 还有 ${files.length - 50} 个文件` : ''}`
    )
  } catch (error: any) {
    return `❌ 解压失败: ${error.message}`
  }
}
