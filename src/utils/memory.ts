import { SessionRow, MessageRow  } from '../types/historyMsg.js'
import { Session, Message } from '../database/historyMsg_dbTools.js'

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content
  const halfLength = Math.floor(maxLength / 2)
  return content.slice(0, halfLength) + 
         `\n...[省略 ${content.length - maxLength} 字符]...` + 
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
            const formattedValues = Object.values(argsObj).map((v: any) => {
              if (typeof v === 'string') return `"${v}"`
              return String(v)
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
    const entry = `${msg.role}: ${displayContent}\n`
    if (maxLength && currentLength + entry.length > maxLength && selected.length > 0) break
    selected.unshift({ role: msg.role, content: displayContent })
    currentLength += entry.length
  }
  return selected.map(m => `${m.role}: ${m.content}`).join('\n')
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
  if(memory.length === 0) return "暂无历史记录"
  const memoryString = memory.map(s => {
    const msgCount = Message.getBySessionId(s.id, Number.MAX_SAFE_INTEGER).length
    return `会话ID:${s.id} | 标题:${s.summary} | 消息数:${msgCount}`
  }).join('\n')
  return `[历史会话索引，仅供你理解上下文使用，切勿向用户展示ID或原样输出]\n${memoryString}`
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
    parts.push(`会话ID: ${session.id}, 标题: ${session.summary || '' } \n对话内容:\n${contextContent}\n`)
  }
  return parts.join('\n\n')
}

export async function getLatestSessionId(): Promise< number | null> {
  const sessions: SessionRow[] = await Session.getAll()
  if (sessions.length === 0) {
    return null
  }
  return sessions[0].id
}

async function getFullContext(sessionId: number): Promise<string> {
  const session: SessionRow | undefined = Session.getById(sessionId)
  if (!session) {
    return "会话不存在"
  }
  const messages: MessageRow[] = Message.getBySessionId(sessionId, Number.MAX_SAFE_INTEGER)
  if (messages.length === 0) {
    return `会话ID: ${sessionId} | 标题: ${session.summary || '' }\n暂无消息记录`
  }
  const contextContent = buildSmartContext(messages, 100)
  return `会话ID: ${session.id} | 标题: ${session.summary || '' } \n${contextContent}`
}

export async function getLatestFullContext(): Promise<string> {
  const sessionId = await getLatestSessionId()
  if (sessionId === null) return "当前无活跃会话"
  return getFullContext(sessionId)
}
