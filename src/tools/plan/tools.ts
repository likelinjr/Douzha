import { TaskPlan, PlanStep } from "../../database/plan_dbTools.js"
import { StepUpdate, planStepType } from "../../types/plan.js"
import { sanitizePaths } from "../../utils/security.js"
import { ToolResult } from "../../types/tool.js"

export async function createNewTaskPlan(goal: string, steps: planStepType[]): Promise<ToolResult> {
  try {
    const planId = TaskPlan.create({
      goal: goal
    })
    steps.forEach((p, index) => {
      PlanStep.create({
        plan_id: Number(planId),
        step: p.step,
        status: (p.status as any) || 'todo',
        result: "",
        step_order: index + 1
      })
    })
    const stepList = steps.map((s, i) => `${i + 1}. ${s.step}`).join('\n')
    return {
      content: [{ type: "text", text: `Success: 创建计划成功：PLAN_ID: ${planId}\n步骤:\n${stepList}`.trim() }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`Error: 创建计划失败: ${message}`) }],
      isError: true
    }
  }
}

export async function getTaskPlan(ids: { sessionId?: number, planId?: number }): Promise<ToolResult> {
  try {
    let fullPlan = ids.planId ? TaskPlan.getFullPlan(ids.planId) : (ids.sessionId ? TaskPlan.getBySessionId(ids.sessionId) : null)
    if (!fullPlan || !fullPlan.steps) {
      return {
        content: [{ type: "text", text: "" }],
        isError: false
      }
    }
    const planList = fullPlan.steps.map((s) =>
      `[${s.step_order}] [${s.status}] ${s.step}${s.result ? ' (结果: ' + s.result + ')' : ''}`
    ).join('\n')
    return {
      content: [{ type: "text", text: `\n[前任务进度]\n总目标: ${fullPlan.goal}\n任务清单: \n${planList}\n(请在更新时引用上述步骤序号)` }],
      isError: false
    }
  } catch {
    return {
      content: [{ type: "text", text: "" }],
      isError: false
    }
  }
}

export async function updateTaskPlan(planId: number, updates: StepUpdate[]): Promise<ToolResult> {
  try {
    let successCount = 0
    updates.forEach(u => {
      const ok = PlanStep.updateByOrder(planId, u.step_order, u.status, u.result || null)
      if (ok) successCount++
    })
    return {
      content: [{ type: "text", text: `Success: 已成功更新 ${successCount} 个步骤的进度。` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: sanitizePaths(`Error: 更新进度失败: ${message}`) }],
      isError: true
    }
  }
}