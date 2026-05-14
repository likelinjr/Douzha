import { Session, Message } from '../../database/dbTools.js'
import { getTaskPlan } from '../plan/tools.js'

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
      result += `[session] id=${sessionId} title=${session.summary || 'unnamed'}\n`
      
      const messages = Message.getBySessionId(sessionId, limit, offset)
      
      if (messages.length > 0) {
        const msgList = messages.map(m => `${m.role}: ${m.content}`).join('\n')
        result += `**获取到的历史消息内容从此处开始**:\n${msgList}\n**获取到的历史消息内容从此处结束**`
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