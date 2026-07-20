import { Session, Message } from '../../database/historyMsg_dbTools.js'
import { getTaskPlan } from '../plan/tools.js'
import { wrapHistory, wrapByRole } from '../../labels/index.js'
import { normalizeNewlines } from '../../utils/stringUtils.js'
import { sanitizePaths } from '../../utils/security.js'
import { ToolResult } from '../../types/tool.js'

function truncateContent(content: string, maxLength: number): string {
  if (content.length <= maxLength) return content
  const halfLength = Math.floor(maxLength / 2)
  return content.slice(0, halfLength) +
         `\n...[省略 ${content.length - maxLength} 字符]...\n` +
         content.slice(-halfLength)
}

export async function listSessions(): Promise<ToolResult> {
  try {
    // 去除当前对话
    const sessions = Session.getAll().slice(1)
    if (sessions.length === 0) {
      return {
        content: [{ type: "text", text: "Empty: No Sessions Found" }],
        isError: false
      }
    }
    const lines = sessions.map((s) => {
      const msgCount = Message.getBySessionId(s.id, Number.MAX_SAFE_INTEGER).length
      return `[${s.id}] ${s.summary || 'Unname'} (${msgCount} msgs)`
    })
    return {
      content: [{ type: "text", text: `Total: ${sessions.length} sessions\n${lines.join('\n')}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`Error: ${message}`) }],
      isError: true
    }
  }
}

const maxSingleToolMsgLength = 200 // 单条工具最大程度
const maxArgLength = 100 // 变量最大长度
export async function getSessionDetail(options: {
  sessionId: number
  limit?: number
  offset?: number
}): Promise<ToolResult> {
  const { sessionId, limit = 10, offset = 0 } = options
  try {
    let result = ""
    const session = Session.getById(sessionId)
    if (session) {
      result += `id: [${sessionId}] 标题: [${session.summary || '' }]\n`
      const messages = Message.getBySessionId(sessionId, limit, offset)
      if (messages.length > 0) {
        const msgList = messages.map(m => {
          let displayContent: string = ''
          if (m.content) {
            displayContent = m.content
            if (m.role === 'tool') {
              displayContent = truncateContent(displayContent, maxSingleToolMsgLength)
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
          return normalizeNewlines(wrapByRole[m.role](displayContent))
        }).join('\n')
        result += `${msgList}`
      } else {
        result += "无历史消息\n"
      }
    } else {
      return {
        isError: true,
        content: [{ type: "text", text: "Error: Session Not Found" }]
      }
    }
    if (session?.plan_id) {
      const planInfo = await getTaskPlan({ planId: session.plan_id })
      planInfo.content[0].type === "text" && ( result += `\n该历史对话对应的任务计划:\n${planInfo.content[0].text || ''}` )
    }
    return {
      content: [{ type: "text", text: wrapHistory(result) }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`Error: ${message}`) }],
      isError: true
    }
  }
}