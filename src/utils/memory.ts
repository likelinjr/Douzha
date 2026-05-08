import fs from 'fs/promises'
import path from 'path'
import { SessionRow, MessageRow  } from '../types/historyStorage.js'
import { Session, Message } from '../database/dbTools.js'

const MEMORY_PATH = path.resolve(process.cwd(), 'data/memory.json')

async function ensureDir() {
  const dir = path.dirname(MEMORY_PATH)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

export async function saveMemory(sessions: SessionRow[]) {
  await ensureDir()
  const data = JSON.stringify(sessions, null, 2)
  await fs.writeFile(MEMORY_PATH, data, 'utf-8')
}

export async function loadMemory(): Promise<string> {
  const memory = Session.getAll()
  if(memory.length === 0) return "暂无历史记录"
  return memory.map(s => 
    `会话ID:${s.id} | 标题:${s.summary}`
  ).join('\n')
}

export async function clearMemory() {
  try {
    await fs.unlink(MEMORY_PATH)
  } catch {}
}

export async function getRecentContext(): Promise<string> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return "当前无活跃会话详情"
  }
  const latestSession: SessionRow = sessions[0] 
  const recentMessages: MessageRow[] = Message.getBySessionId(latestSession.id, 20) 
  const recentString = `当前会话ID: ${latestSession.id}, 计划ID: ${latestSession.plan_id || '无'}\n最近8条内容:\n` + 
      recentMessages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n')
  return recentString
}

export async function getLatestSessionId(): Promise< number | null> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return null
  }
  return sessions[0].id
}

// test
// const loadMemory_result = await loadMemory()
// console.log(loadMemory_result)
// const getRecentContext_result = await getRecentContext()
// console.log(getRecentContext_result)

