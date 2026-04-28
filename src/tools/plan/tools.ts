import { validatePath } from "../../utils/security.js"
import path from 'path'
import fs from 'fs/promises'
import { planStepType } from "../../types/tool.js"

export async function syncTaskPlan(goal: string, plan: planStepType[]): Promise<string> {
  try {
    const planPath = "data/task_plan.json"

    await fs.mkdir(path.dirname(planPath), { recursive: true })

    const planData = {
      goal,
      plan,
      updatedAt: new Date().toISOString()
    }

    await fs.writeFile(planPath, JSON.stringify(planData, null, 2), 'utf-8')

    const summary = plan.map(p => `[${p.status}] ${p.task}`).join('\n')
    return `✅ 任务规划已同步到 ${planPath}：\n${summary}`
  } catch (error: any) {
    return `❌ 同步规划失败: ${error.message}`
  }
}

export async function getTaskPlan(): Promise<string> {
  try {
    const planPath = "data/task_plan.json"
    const safePath = validatePath(planPath)

    const content = await fs.readFile(safePath, 'utf-8')
    const data = JSON.parse(content)

    let planIsDone = data.plan.length === 0 || data.plan[data.plan.length-1].status === 'done'
    if(planIsDone){
      return ""
    }
    const planList = data.plan.map((p: any) => 
      `- [${p.status}] ${p.task}${p.result ? ' (结果: ' + p.result + ')' : ''}`
    ).join('\n')
    return `\n\n📢 【当前任务进度】\n总目标: ${data.goal}\n任务清单:\n${planList}\n(请根据上述进度执行后续步骤，严禁重复已完成的工作)`
  } catch {
    return ""
  }
}