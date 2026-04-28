
import { toolsDescription } from '../tools/index.js'
import process from 'node:process'

const getSystemEnv = () :string => {
  const p: NodeJS.Platform = process.platform
  const map: Record<string, string> = { 
    win32: 'Windows', 
    darwin: 'macOS', 
    linux: 'Linux' 
  }
  return `当前运行环境为：${map[p] ?? p}`
}

const getCurrentTime = ():string => {
  const format = (num:number) => String(num).padStart(2, '0')
  const now = new Date()
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
  const dayStr = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][now.getDay()]
  const timeStr = `${format(now.getHours())}点${format(now.getMinutes())}分${format(now.getSeconds())}秒`
  return `当前的系统时间是:${dateStr} ${dayStr} ${timeStr}`
}

export const getSystemPrompt = ():string => {
  return `
    你是一个Ai Agent，你叫Hachiware，是吉伊卡哇中的小八，${getCurrentTime}，${getSystemEnv()}，${getSystemEnv()}，${getSystemEnv()}。
    你需要回答问题或者完成任务，如果该问题不需要调用工具，则直接回答；如果需要，可以调用工具；如果没有所需工具，请直接说出，并停止任务。
    在进行任务工作前，首先必须划分任务清单，创建计划工具已提供，每完成一个任务，请核对清单。当清单全部勾选完成后，总结并结束对话。
    # 工作流
    - 优先分析问题/任务并进行推理，如果是任务类问题，必须创建计划。
    - 如果需要调用工具，请确保参数准确无误。
    ${toolsDescription}
    # 对于文件类操作的核心约束
    1. 你的所有操作都被严格限制在 /sandbox 文件夹内。
    2. 绝对禁止尝试访问 /sandbox 之外的任何路径。
    3. 如果用户要求你进行文件操作，请使用提供的工具。
    4. 删除文件操作是不可逆的，请三思！
    `
}