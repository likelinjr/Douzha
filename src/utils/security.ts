import path from 'path'
const __dirname = import.meta.dirname
const ROOT_DIR = path.resolve(__dirname, '../../')
const HOME_DIR = path.resolve(ROOT_DIR, 'Doza')
const WORKSPACE_DIR = path.resolve(HOME_DIR, 'Workspace')
const SKILLS_DIR = path.resolve(ROOT_DIR, 'src/skills/Skills')

export function validatePath(inputPath: string): string {
  let cleanedPath = inputPath.replace(/['"]/g, '').trim()
  if (!cleanedPath.startsWith('/Doza') && !cleanedPath.startsWith('/Skills')) {
    throw new Error(`🚫 安全警报：访问非法路径 [${cleanedPath}]`)
  }
  // 处理 skills 目录路径
  if (cleanedPath.startsWith('/Skills')) {
    cleanedPath = cleanedPath.replace('/Skills', '.')
    const resolvedPath = path.resolve(SKILLS_DIR, cleanedPath)
    if (!resolvedPath.startsWith(SKILLS_DIR)) {
      throw new Error(`🚫 安全警报：访问非法路径 [${cleanedPath}]`)
    }
    return resolvedPath
  }
  // 处理 Doza 目录路径
  if (cleanedPath.startsWith('/Doza')) {
    cleanedPath = cleanedPath.replace('/Doza', '.')
  }
  const resolvedPath = path.resolve(HOME_DIR, cleanedPath)
  if (!resolvedPath.startsWith(HOME_DIR)) {
    throw new Error(`🚫 安全警报：访问非法路径 [${cleanedPath}]`)
  }
  return resolvedPath
}

export function checkWritePermission(targetPath: string): boolean {
  return targetPath.startsWith(WORKSPACE_DIR) && !targetPath.startsWith(SKILLS_DIR)
}

export function mapToVirtualPath(realPath: string): string {
  const normalizedPath = realPath.replace(/\\/g, '/')
  const dozaIndex = normalizedPath.lastIndexOf('/Doza/')
  if (dozaIndex === -1) {
    return realPath 
  }
  return normalizedPath.substring(dozaIndex)
}

export function sanitizePaths(text: string): string {
  if (!text) return ""
  let safeMsg = text.replace(/\\/g, '/')
  const rootDirStr = ROOT_DIR.replace(/\\/g, '/')
  const homeDirStr = HOME_DIR.replace(/\\/g, '/')
  const skillsDirStr = SKILLS_DIR.replace(/\\/g, '/')
  safeMsg = safeMsg.replace(new RegExp(homeDirStr, 'ig'), '/Doza')
  safeMsg = safeMsg.replace(new RegExp(skillsDirStr, 'ig'), '/Skills')
  // 如果还有遗漏的项目根目录路径，直接抹成 /
  safeMsg = safeMsg.replace(new RegExp(rootDirStr, 'ig'), '/')
  // 恢复常见的 Node 报错信息中的引号等符号
  return safeMsg
}

// console.log( "skill目录", SKILLS_DIR )
// console.log( "/Skills", validatePath("/Skills") )
// console.log( "/Skills/pdf right", validatePath("/Skills/pdf") )
// try {
//   validatePath("/pdf")
// } catch(e:any){
//   console.log("Skills/pdf wrong", e.message)
// }
// console.log( "Home目录",HOME_DIR )
// console.log( "/Doza",validatePath("/Doza") )
// console.log( "/Doza/Workspace right",validatePath("/Doza/Workspace") )
// try {
//   validatePath("Doza/Workspace")
// } catch(e:any){
//   console.log( "/Doza/Workspace wrong",e.message)
// }
