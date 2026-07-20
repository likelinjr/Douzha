import { SessionRow, MessageRow  } from '../types/historyMsg.js'
import { Session, Message } from '../database/historyMsg_dbTools.js'
import { wrapByRole } from '../labels/index.js'
import { normalizeNewlines } from './stringUtils.js'

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content
  const halfLength = Math.floor(maxLength / 2)
  return content.slice(0, halfLength) + 
         `\n...[省略 ${content.length - maxLength} 字符]...\n` + 
         content.slice(-halfLength)
}

function buildSmartContext(
  messages: MessageRow[],
  maxSingleMsgLength: number,
  maxLength?: number,
  maxMessages?: number
): string {
  const selected: { role: string; content: string }[] = []
  let currentLength = 0
  for (let i = messages.length - 1; i >= 0; i--) {
    if (maxMessages && selected.length >= maxMessages) break
    const msg = messages[i]
    let displayContent: string = ''
    if (msg.content) {
      displayContent = msg.content
      if (msg.role === 'tool') {
        displayContent = truncateContent(displayContent, maxSingleMsgLength)
      }
    }
    if (msg.tool_calls) {
      try {
        const toolCallsArray = JSON.parse(msg.tool_calls)
        const toolCalls = toolCallsArray.map((tc: any) => {
          const toolName = tc.function?.name || ''
          let argsStr = ''
          try {
            const argsObj = JSON.parse(tc.function?.arguments || '{}')
            const maxArgLength = 100
            const formattedValues = Object.values(argsObj).map((v: any) => {
              let str: string
              if (typeof v === 'string') str = `"${v}"`
              else if (typeof v === 'object') str = JSON.stringify(v)
              else str = String(v)
              return str.length > maxArgLength ? truncateContent(str, maxArgLength) : str
            })
            argsStr = formattedValues.join(', ')
          } catch {
            argsStr = tc.function?.arguments || ''
          }
          return `${toolName}(${argsStr})`
        })
        const toolCallsStr = toolCalls.join(', ')
        if (displayContent) {
          displayContent = `${displayContent}\n ${toolCallsStr}`
        } else {
          displayContent = toolCallsStr
        }
      } catch {
        if (displayContent) {
          displayContent = `${displayContent}\n`
        } else {
          displayContent = '[parse error]'
        }
      }
    }
    if (!displayContent) continue
    const finalContent = normalizeNewlines(wrapByRole[msg.role](displayContent))
    if (maxLength && currentLength + finalContent.length > maxLength && selected.length > 0) break
    selected.unshift({ role: msg.role, content: finalContent })
    currentLength += finalContent.length
  }
  return (selected.map(m => `${m.content}`).join('\n')).trim()
}

export async function saveMemory(message: MessageRow): Promise<number> {
  const messageId = Message.create({
    session_id: message.session_id,
    role: message.role,
    content: message.content,
    reasoning_content: message.reasoning_content || null,
    tool_calls: message.tool_calls || null,
    tool_call_id: message.tool_call_id || null
  })
  return messageId
}

// 加载所有会话标题和消息数
export async function loadMemory(): Promise<string> {
  const memory = Session.getAll()
  if(memory.length === 0) return "暂无历史对话"
  const memoryString = memory.map(s => {
    const msgCount = Message.getBySessionId(s.id, Number.MAX_SAFE_INTEGER).length
    return `- 会话ID [${s.id}] | 标题:${s.summary} | 消息数:${msgCount}`
  }).join('\n')
  return (`# 历史记录摘要\n[历史对话索引，理解上下文使用，切勿向用户展示ID或原样输出]\n${memoryString}`).trim()
}

export async function clearMemory() {
}

export async function getRecentContext(): Promise<string> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return "当前无活跃会话详情"
  }
  const recentSessions = sessions.slice(0, 3)
  const parts: string[] = []
  for (let i = 0; i < recentSessions.length; i++) {
    const session = recentSessions[i]
    const [maxSingleMsgLength, maxLength, maxMessages] = i === 0
      ? [100, 2000, 20]
      : [50, 1000, 20]
    const messages: MessageRow[] = Message.getBySessionId(session.id, 20)
    const contextContent = buildSmartContext(messages, maxSingleMsgLength, maxLength, maxMessages)
    parts.push(`- 会话ID: ${session.id}, 标题: ${session.summary || '' } \n- 对话内容:\n${contextContent}\n`)
  }
  return ('# 最近三次对话细节' + '\n' + parts.join('\n\n')).trim()
}

export async function getLatestSession(): Promise<SessionRow | null> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return null
  }
  return sessions[0]
}

async function getFullContext(sessionId: number): Promise<string> {
  const session: SessionRow | undefined = Session.getById(sessionId)
  if (!session) {
    return "会话不存在"
  }
  const messages: MessageRow[] = Message.getBySessionId(sessionId, Number.MAX_SAFE_INTEGER)
  if (messages.length === 0) {
    return `- 会话ID: ${sessionId} | 标题: ${session.summary || '' }\n暂无消息记录`
  }
  const contextContent = buildSmartContext(messages, 50, 5000, 100)
  return `- 会话ID: ${session.id} | 标题: ${session.summary || '' }\n${contextContent}`.trim()
}

export async function getLatestFullContext(): Promise<string> {
  const session = await getLatestSession()
  if (!session) return "当前无活跃会话"
  return getFullContext(session.id)
}

// console.log( await loadMemory() )