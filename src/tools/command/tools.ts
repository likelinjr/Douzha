import { spawn, execFile, ChildProcess } from 'child_process'
import { promisify } from 'util'
import { ToolResult } from '../../types/tool.js'

const execFilePromise = promisify(execFile)
const END_MARKER = '___DOZA_EXEC_DONE___'
let shellProcess: ChildProcess | null = null
let isBusy = false
async function ensureTerminalReady(): Promise<ToolResult | null> {
  if (shellProcess && shellProcess.exitCode === null && !shellProcess.killed) {
    return null
  }
  try {
    await execFilePromise('docker', ['exec', 'doza', 'echo', 'probe'], {
      encoding: 'utf8',
      timeout: 5000
    })
    shellProcess = spawn('docker', ['exec', '-i', 'doza', 'bash'], {
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
    })
    shellProcess.on('exit', () => {
      shellProcess = null
    })
    shellProcess.on('error', () => {
      shellProcess = null
    })
    return null
  } catch (error: unknown) {
    const execError = error as { stderr?: string, message?: string }
    const errMsg = execError.stderr?.trim() || execError.message?.trim() || String(error)
    return {
      content: [{ type: "text", text: `终端环境错误: ${errMsg}` }],
      isError: true
    }
  }
}

export async function executeCommand(command: string): Promise<ToolResult> {
  if (isBusy) {
    return {
      content: [{ type: "text", text: '终端正忙，请等待上一个命令执行完毕后再试' }],
      isError: true
    }
  }
  const setupError = await ensureTerminalReady()
  if (setupError) {
    return setupError
  }
  isBusy = true
  return new Promise((resolve) => {
    let output = ''
    let errorOutput = ''
    const timeout = setTimeout(() => {
      cleanup()
      resolve({
        content: [{ type: "text", text: `执行超时或卡死，可能是因为遇到了需要交互确认的命令，已强行截断。\n当前输出记录: ${output}` }],
        isError: true
      })
    }, 300000)
    const onStdout = (data: Buffer) => {
      output += data.toString('utf8')
      if (output.includes(END_MARKER)) {
        cleanup()
        const cleanResult = output.replace(END_MARKER, '').trim()
        resolve({
          content: [{ type: "text", text: cleanResult || (errorOutput ? `[警告/错误输出]: ${errorOutput.trim()}` : '执行成功') }],
          isError: false
        })
      }
    }
    const onStderr = (data: Buffer) => {
      errorOutput += data.toString('utf8')
    }
    const onClose = () => {
      cleanup()
      resolve({
        content: [{ type: "text", text: `终端底层进程意外终止` }],
        isError: true
      })
    }
    const cleanup = () => {
      clearTimeout(timeout)
      shellProcess?.stdout?.removeListener('data', onStdout)
      shellProcess?.stderr?.removeListener('data', onStderr)
      shellProcess?.removeListener('close', onClose)
      isBusy = false
    }
    shellProcess?.stdout?.on('data', onStdout)
    shellProcess?.stderr?.on('data', onStderr)
    shellProcess?.on('close', onClose)
    const finalCommand = `${command.trim()}; echo ${END_MARKER}\n`
    shellProcess?.stdin?.write(finalCommand)
  })
}

// docker run -d --name doza -v C:/Users/likel/DeskTop/Douzha/Doza:/Doza:ro -v C:/Users/likel/DeskTop/Douzha/Doza/Workspace:/Doza/Workspace:rw -v C:/Users/likel/DeskTop/Douzha/src/skills/Skills:/Skills:ro -w / python:3.11-slim tail -f /dev/null
