import { planStepType } from "../../types/tool.js"
import { TaskPlan, PlanStep } from "../../database/dbTools.js"
import { PlanStepRow } from "../../types/historyStorage.js"

export async function createNewTaskPlan(goal: string, steps :planStepType[]): Promise<string> {
  try {
    const planId = TaskPlan.create({
      goal: goal,
      status: 'todo'
    })
    steps.forEach((p, index) => {
      PlanStep.create({
        plan_id: Number(planId),
        step: p.step,
        status: (p.status as any) || 'todo',
        result: "",  // 初始结果为空
        step_order: index + 1
      })
    })
    return `SUCCESS: 任务计划已存入数据库。PLAN_ID: ${planId}`
  } catch (error: any) {
    return `ERROR: 创建计划失败: ${error.message}`
  }
}

export async function getTaskPlan(ids: { sessionId?: number, planId?: number }): Promise<string> {
  try {
    let fullPlan = ids.planId ? TaskPlan.getFullPlan(ids.planId) : (ids.sessionId ? TaskPlan.getBySessionId(ids.sessionId) : null)
    if (!fullPlan || !fullPlan.steps) return ""

    const planList = fullPlan.steps.map((s) => 
      `${s.step_order}. [${s.status}] ${s.step}${s.result ? ' (结果: ' + s.result + ')' : ''}`
    ).join('\n')

    return `\n\n📢 【当前任务进度】\n总目标: ${fullPlan.goal}\n任务清单:\n${planList}\n(请在更新时引用上述步骤序号)`
  } catch { return "" }
}

export async function updateTaskPlan(planId: number, updates: PlanStepRow[]): Promise<string> {
  try {
    let successCount = 0
    updates.forEach(u => {
      const ok = PlanStep.updateByOrder(planId, u.step_order, u.status, u.result || null)
      if (ok) successCount++
    })
    return `SUCCESS: 已成功更新 ${successCount} 个步骤的进度。`
  } catch (error: any) {
    return `ERROR: 更新进度失败: ${error.message}`
  }
}