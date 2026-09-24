import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
import { execFile } from 'child_process'
import { wrapSkill } from '../../labels/index.js'
import { CommandMatch } from '../../types/skill.js'
import { sanitizePaths } from '../../utils/security.js'
import { ToolResult } from '../../types/tool.js'

const execFilePromise = promisify(execFile)

const __dirname = import.meta.dirname
const ROOT_DIR = path.resolve(__dirname, '../../')
const SKILLS_DIR = path.resolve(ROOT_DIR, 'skills/Skills')

function extractArguments(content: string): string | undefined {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---/
  const match = content.match(frontmatterRegex)
  if (!match) return undefined
  const argsMatch = match[1].match(/^arguments:\s*(.+)$/m)
  return argsMatch ? argsMatch[1].trim() : undefined
}

function replaceParameters(content: string, args?: string): string {
  if (!args) return content
  const argumentsDef = extractArguments(content)
  const argsArray = args.split(/\s+/)
  let result = content
  if (argumentsDef) {
    const namedArgs = argumentsDef.split(/\s+/)
    namedArgs.forEach((argName, index) => {
      if (argsArray[index] !== undefined) {
        const regex = new RegExp(`\\$${argName}`, 'g')
        result = result.replace(regex, argsArray[index])
      }
    })
  }
  // 替换索引参数 $0, $1, $2...
  argsArray.forEach((arg, index) => {
    const regex = new RegExp(`\\$${index}`, 'g')
    result = result.replace(regex, arg)
  })
  // 替换 $ARGUMENTS[0], $ARGUMENTS[1]...
  argsArray.forEach((arg, index) => {
    const regex = new RegExp(`\\$ARGUMENTS\\[${index}\\]`, 'g')
    result = result.replace(regex, arg)
  })
  // 替换 $ARGUMENTS
  result = result.replace(/\$ARGUMENTS\b/g, args)
  return result
}

function findInlineCommands(content: string): CommandMatch[] {
  const matches: CommandMatch[] = []
  const regex = /!`([^`]+)`/g
  let match
  while ((match = regex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      command: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length
    })
  }
  return matches
}

function findBlockCommands(content: string): CommandMatch[] {
  const matches: CommandMatch[] = []
  // 只匹配以 ! 开头的代码块 ```! ... ```
  const regex = /```!\s*([\s\S]*?)```/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const command = match[1].trim()
    if (command) {
      matches.push({
        fullMatch: match[0],
        command: command,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      })
    }
  }
  return matches
}

async function runEmbeddedCommand(command: string): Promise<string> {
  try {
    const { stdout } = await execFilePromise('docker', ['exec', 'doza', 'bash', '-lc', command], {
      encoding: 'utf8',
      timeout: 30000
    })
    return stdout.trim()
  } catch (error: unknown) {
    const execError = error as { stderr?: string; message?: string }
    return execError.stderr?.trim() || execError.message?.trim() || String(error)
  }
}

async function executeEmbeddedCommands(content: string): Promise<string> {
  let result = content

  // 执行内联命令 (!`command`)
  const inlineCommands = findInlineCommands(result)
  // 逆序处理，从后往前替换，避免索引变化问题
  for (let i = inlineCommands.length - 1; i >= 0; i--) {
    const cmd = inlineCommands[i]
    const output = await runEmbeddedCommand(cmd.command)
    result = result.slice(0, cmd.startIndex) + output + result.slice(cmd.endIndex)
  }

  // 执行代码块命令 (```! ... ```)
  const blockCommands = findBlockCommands(result)
  for (let i = blockCommands.length - 1; i >= 0; i--) {
    const cmd = blockCommands[i]
    const output = await runEmbeddedCommand(cmd.command)
    result = result.slice(0, cmd.startIndex) + output + result.slice(cmd.endIndex)
  }

  return result
}

export async function executeSkill(skillName: string, args?: string): Promise<ToolResult> {
  const actualSkillName = skillName.includes(':') ? skillName.split(':').pop()! : skillName
  const skillPath = path.join(SKILLS_DIR, actualSkillName, 'SKILL.md')
  if (!fs.existsSync(skillPath)) {
    return {
      content: [{ type: "text", text: sanitizePaths(`Error: Skill "${actualSkillName}" not found at ${skillPath}`) }],
      isError: true
    }
  }
  const content = fs.readFileSync(skillPath, 'utf-8')
  const replacedContent = replaceParameters(content, args)
  const executedContent = await executeEmbeddedCommands(replacedContent)
  return {
    content: [{ type: "text", text: wrapSkill(executedContent) }],
    isError: false
  }
}