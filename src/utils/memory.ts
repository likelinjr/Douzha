import { SessionRow, MessageRow  } from '../types/historyStorage.js'
import { Session, Message } from '../database/dbTools.js'
import { commonLog } from './debug.js'

const CONTEXT_CONFIG = {
  MAX_CONTEXT_LENGTH: parseInt(process.env.MAX_CONTEXT_LENGTH || '6000'),
  MAX_MESSAGES: parseInt(process.env.MAX_MESSAGES || '8'),
  MAX_SINGLE_MSG_LENGTH: parseInt(process.env.MAX_SINGLE_MSG_LENGTH || '500')
}

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content
  
  const halfLength = Math.floor(maxLength / 2)
  return content.slice(0, halfLength) + 
         `\n...[省略 ${content.length - maxLength} 字符]...` + 
         content.slice(-halfLength)
}

function buildSmartContext(messages: MessageRow[], maxLength: number = CONTEXT_CONFIG.MAX_CONTEXT_LENGTH): string {
  const selected: { role: string; content: string }[] = []
  let currentLength = 0

  for (let i = messages.length - 1; i >= 0 && selected.length < CONTEXT_CONFIG.MAX_MESSAGES; i--) {
    const msg = messages[i]
    
    if (!msg.content) continue
    
    let displayContent: string = msg.content
    
    if (msg.role === 'tool') {
      displayContent = truncateContent(displayContent, CONTEXT_CONFIG.MAX_SINGLE_MSG_LENGTH)
    }
    
    const entry = `${msg.role}: ${displayContent}\n`
    
    if (currentLength + entry.length > maxLength && selected.length > 0) break
    
    selected.unshift({ role: msg.role, content: displayContent })
    currentLength += entry.length
  }

  return selected.map(m => `**${m.role}**: ${m.content}`).join('\n')
}

export async function saveMemory(message: MessageRow): Promise<number> {
  const messageId = Message.create({
    session_id: message.session_id,
    role: message.role,
    content: message.content,
    tool_calls: message.tool_calls || null,
    tool_call_id: message.tool_call_id || null
  })
  return messageId
}

export async function loadMemory(): Promise<string> {
  const memory = Session.getAll()
  if(memory.length === 0) return "暂无历史记录"
  return memory.map(s => {
    const msgCount = Message.getBySessionId(s.id).length
    return `会话ID:${s.id} | 标题:${s.summary} | 消息数:${msgCount}`
  }).join('\n')
}

export async function clearMemory() {
}

export async function getRecentContext(): Promise<string> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return "当前无活跃会话详情"
  }
  const latestSession: SessionRow = sessions[0] 
  const recentMessages: MessageRow[] = Message.getBySessionId(latestSession.id, 20) 
  const contextContent = buildSmartContext(recentMessages)
  const recentString = `当前会话ID: ${latestSession.id}, 计划ID: ${latestSession.plan_id || '无'}\n最近对话内容:\n` + contextContent
  return recentString
}

export async function getLatestSessionId(): Promise< number | null> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return null
  }
  return sessions[0].id
}

const loadMemory_result = await loadMemory()
commonLog(loadMemory_result)
const getRecentContext_result = await getRecentContext()
commonLog(getRecentContext_result)

