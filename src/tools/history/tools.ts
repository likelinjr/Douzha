import { Session, Message } from '../../database/dbTools.js'
import { getTaskPlan } from '../plan/tools.js'

export async function listSessions(): Promise<string> {
  try {
    const sessions = Session.getAll()
    if (sessions.length === 0) {
      return "EMPTY: no sessions found"
    }

    const lines = sessions.map((s, i) => {
      const msgCount = Message.getBySessionId(s.id, 1).length
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
        result += `\nmessages:\n${msgList}\n`
      } else {
        result += "messages: (empty)\n"
      }
    } else {
      return "ERROR: session not found"
    }
    
    const targetPlanId = planId || (session?.plan_id)
    if (targetPlanId) {
      const planInfo = await getTaskPlan({ planId: Number(targetPlanId) })
      result += `\nplan:\n${planInfo}`
    }

    return result
  } catch (error: any) {
    return `ERROR: ${error.message}`
  }
}