import { Session, Message } from '../../database/historyMsg_dbTools.js'
import { getTaskPlan } from '../plan/tools.js'

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content
  const halfLength = Math.floor(maxLength / 2)
  return content.slice(0, halfLength) +
         `\n...[省略 ${content.length - maxLength} 字符]...` +
         content.slice(-halfLength)
}

export async function listSessions(): Promise<string> {
  try {
    const sessions = Session.getAll()
    if (sessions.length === 0) {
      return "EMPTY: no sessions found"
    }
    const lines = sessions.map((s, i) => {
      const msgCount = Message.getBySessionId(s.id, Number.MAX_SAFE_INTEGER).length
      return `${i + 1}. [${s.id}] ${s.summary || 'unnamed'} (${msgCount} msgs)`
    })
    return `TOTAL: ${sessions.length} sessions\n${lines.join('\n')}`
  } catch (error: any) {
    return `ERROR: ${error.message}`
  }
}

export async function getHistoryDetail(
  sessionId: number, 
  planId?: number, 
  limit: number = 10, 
  offset: number = 0
): Promise<string> {
  try {
    let result = ""
    const session = Session.getById(sessionId)
    if (session) {
      result += `id=${sessionId} 标题：${session.summary || '' }\n`
      const messages = Message.getBySessionId(sessionId, limit, offset)
      if (messages.length > 0) {
        const maxSingleMsgLength = 200
        const msgList = messages.map(m => {
          let displayContent: string = ''
          if (m.content) {
            displayContent = m.content
            if (m.role === 'tool') {
              displayContent = truncateContent(displayContent, maxSingleMsgLength)
            }
          }
          if (m.tool_calls) {
            try {
              const toolCallsArray = JSON.parse(m.tool_calls)
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
          return `${m.role}: ${displayContent}`
        }).join('\n')
        result += `**历史消息内容从此处开始**\n${msgList}\n**历史消息内容从此处结束**`
      } else {
        result += "无历史消息\n"
      }
    } else {
      return "ERROR: session not found"
    }
    const targetPlanId = planId || (session?.plan_id)
    if (targetPlanId) {
      const planInfo = await getTaskPlan({ planId: Number(targetPlanId) })
      result += `\nplan（该历史会话对应的任务计划）:\n${planInfo}`
    }
    return result
  } catch (error: any) {
    return `ERROR: ${error.message}`
  }
}

// getHistoryDetail(4).then(console.log).catch(console.error)