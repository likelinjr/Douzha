import { dbManager } from './database.js'
import { Session } from './historyMsg_dbTools.js'
import { TaskPlanRow, PlanStepRow, FullTaskPlan, StepStatus } from '../types/plan.js'

export const TaskPlan = {
  create(plan: Omit<TaskPlanRow, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = dbManager.db.prepare(`
      INSERT INTO task_plans (goal) VALUES (@goal)
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