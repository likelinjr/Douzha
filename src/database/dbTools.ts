import { dbManager } from './database.js'
import { 
  SessionRow, MessageRow, TaskPlanRow, PlanStepRow, FullTaskPlan, 
  PlanStatus, StepStatus 
} from '../types/historyStorage.js'


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

// 消息管理
export const Message = {
  create(msg: MessageRow): number {
    const stmt = dbManager.db.prepare(`
      INSERT INTO messages (session_id, role, content, tool_calls, tool_call_id)
      VALUES (@session_id, @role, @content, @tool_calls, @tool_call_id)
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
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `)
    const rows = stmt.all(sessionId, limit, offset) as MessageRow[]
    return rows.reverse() 
  }
}

// 任务计划管理
export const TaskPlan = {
  create(plan: Omit<TaskPlanRow, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = dbManager.db.prepare(`
      INSERT INTO task_plans (goal, status) VALUES (@goal, @status)
    `) 
    return stmt.run(plan).lastInsertRowid as number
  },

  getBySessionId(sessionId: number | string): FullTaskPlan | undefined {
    const session = Session.getById(sessionId)
    if (!session || !session.plan_id) return undefined
    return this.getFullPlan(session.plan_id)
  },

  getById(id: number): TaskPlanRow | undefined {
    const stmt = dbManager.db.prepare(`SELECT * FROM task_plans WHERE id = ?`) 
    return stmt.get(id) as TaskPlanRow | undefined
  },

  updateStatus(id: number, status: PlanStatus): boolean {
    const stmt = dbManager.db.prepare(`
      UPDATE task_plans 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `) 
    return stmt.run(status, id).changes > 0
  },

  // 获取完整计划：包含所有步骤
  getFullPlan(id: number): FullTaskPlan | undefined {
    const plan = this.getById(id)
    if (!plan) return undefined

    const steps = PlanStep.getByPlanId(id)
    return {
      ...plan,
      steps: steps
    } as FullTaskPlan
  }
}

// 计划步骤管理
export const PlanStep = {
  create(step: Omit<PlanStepRow, 'id'>): number {
    const stmt = dbManager.db.prepare(`
      INSERT INTO plan_steps (plan_id, step, status, result, step_order)
      VALUES (@plan_id, @step, @status, @result, @step_order)
    `) 
    return stmt.run(step).lastInsertRowid as number
  },

  getByPlanId(planId: number): PlanStepRow[] {
    const stmt = dbManager.db.prepare(`
      SELECT * FROM plan_steps WHERE plan_id = ? ORDER BY step_order ASC
    `) 
    return stmt.all(planId) as PlanStepRow[]
  },

  updateStepResult(id: number, status: StepStatus, result: string | null = null): boolean {
    const stmt = dbManager.db.prepare(`
      UPDATE plan_steps 
      SET status = ?, result = COALESCE(?, result)
      WHERE id = ?
    `) 
    return stmt.run(status, result, id).changes > 0
  },

  updateByOrder(planId: number, order: number, status: StepStatus, result: string | null = null): boolean {
    const stmt = dbManager.db.prepare(`
      UPDATE plan_steps 
      SET status = ?, result = COALESCE(?, result)
      WHERE plan_id = ? AND step_order = ?
    `) 
    return stmt.run(status, result, planId, order).changes > 0
  },

  delete(id: number): boolean {
    const stmt = dbManager.db.prepare(`DELETE FROM plan_steps WHERE id = ?`) 
    return stmt.run(id).changes > 0
  }
}