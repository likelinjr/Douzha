import { exec } from 'child_process'
import { promisify } from 'util'
import { validatePath } from '../../utils/security.js'

const execPromise = promisify(exec)

export async function executeCommand(command: string, cwd: string = "."): Promise<string> {
  try {
    const safeCwd = validatePath(cwd)
        
    const shellPath = process.platform === 'win32' ? 'bash.exe' : '/bin/sh'

    const { stdout, stderr } = await execPromise(command, {
      cwd: safeCwd,
      shell: shellPath,
      timeout: 30000,
      env: { ...process.env, LANG: 'zh_CN.UTF-8' }
    })

    let result = ""
    if (stdout) result += `[标准输出]:\n${stdout}\n`
    if (stderr) result += `[标准错误]:\n${stderr}\n`

    return result.trim() || `✅ 命令执行成功，无控制台输出。`

  } catch (error: any) {
    let errorMsg = `❌ 命令执行失败 (退出码: ${error.code || '未知'}):\n`
    if (error.stdout) errorMsg += `[标准输出]:\n${error.stdout}\n`
    if (error.stderr) errorMsg += `[标准错误]:\n${error.stderr}`
        
    return errorMsg.trim()
  }
}