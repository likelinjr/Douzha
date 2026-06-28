import { dbManager } from './database.js'
import { SessionRow, MessageRow } from '../types/historyMsg.js'

export const Session = {
  create(summary: string | null = null, planId: number | null = null): number {
    const stmt = dbManager.db.prepare(`
      INSERT INTO sessions (summary, plan_id) VALUES (?, ?)
    `) 
    return stmt.run(summary, planId).lastInsertRowid as number
  },
  getById(id: number | string): SessionRow | undefined {
    const stmt = dbManager.db.prepare(`SELECT * FROM sessions WHERE id = ?`) 
    return stmt.get(id) as SessionRow | undefined
  },
  delete(id: number | string): boolean {
    const stmt = dbManager.db.prepare(`DELETE FROM sessions WHERE id = ?`) 
    return stmt.run(id).changes > 0
  },
  getAll(): SessionRow[] {
    const stmt = dbManager.db.prepare(`SELECT * FROM sessions ORDER BY created_at DESC`)
    return stmt.all() as SessionRow[]
  }
}

export const Message = {
  create(msg: MessageRow): number {
    const stmt = dbManager.db.prepare(`
      INSERT INTO messages (session_id, role, content, reasoning_content, tool_calls, tool_call_id)
      VALUES (@session_id, @role, @content, @reasoning_content, @tool_calls, @tool_call_id)
    `) 
    return stmt.run(msg).lastInsertRowid as number
  },
  delete(id: number): boolean {
    const stmt = dbManager.db.prepare(`DELETE FROM messages WHERE id = ?`) 
    return stmt.run(id).changes > 0
  },
  getBySessionId(sessionId: string | number, limit: number = 10, offset: number = 0): MessageRow[] {
    const stmt = dbManager.db.prepare(`
      SELECT * FROM messages 
      WHERE session_id = ? 
      ORDER BY id DESC 
      LIMIT ? OFFSET ?
    `)
    const rows = stmt.all(sessionId, limit, offset) as MessageRow[]
    return rows.reverse() 
  }
}