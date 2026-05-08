// 任务决策与规划

import { think } from './index.js'
import { HACHIWARE_IDENTITY } from './identity.js'
import { loadMemory, getRecentContext } from '../utils/memory.js'
import { Session, TaskPlan, PlanStep } from '../database/dbTools.js'
import { commonLog, DEBUG_DECIDE } from '../utils/debug.js'
import { getLatestSessionId } from '../utils/memory.js'

function getDecisionPrompt(memory: string, recentContext: string): string {
  const identity = HACHIWARE_IDENTITY
  return `
    ${identity}
    # 历史记录摘要
    ${ memory }

    # 最近一次对话细节
    ${ recentContext }
 
    # 当前任务
    分析用户最新消息，判断意图：
    1. **continue**: 用户在继续当前话题。
    2. **new_task**: 用户想要进行全新的、独立的话题。
    3. 你并不需要做出任何回答，当前阶段只完成以上任务。
    4. 根据用户问题复杂度，如果任务较为复杂，选择 advanced，否则选择 base。
    5. 非必要不创建任务计划，除非是复杂任务。

    # 输出规范
    直接输出 JSON，格式如下：
    {
      "intent": "continue" | "new_task",
      "level": "base" | "advanced",
      "new_plan_goal": "如果是新复杂任务，提供计划目标，否则null",
      "new_session_summary": "如果是新任务，提供简短标题，否则null",
      "steps": ["步骤1: 描述", "步骤2: 描述"], // 如果是新任务且复杂，请列出初步执行步骤
      "session_id": "若是 continue，填入最近一次对话中的 session_id",
      "plan_id": "若是 continue，填入最近一次对话中的 plan_id"
    }
  `
}

export async function runDecision(
  userMessage: string
): Promise<{ level: string, plan_id?: number, session_id?: number | null }> {

  const [ memory, recentContext ] = await Promise.all([
    loadMemory(),
    getRecentContext()
  ])

  const decisionModel = process.env.DECISION_MAKER || 'deepseek'
  const prompt = getDecisionPrompt(memory, recentContext)

  const response = await think([{ role: 'user', content: userMessage }], [], prompt, decisionModel, true)

  try {
    const match = (response.answer || "").match(/\{[\s\S]*\}/)
    if (!match) throw new Error("未匹配到 JSON")
    const decision = JSON.parse(match[0])

    if (decision.intent === 'new_task') {

      DEBUG_DECIDE && console.log("\n") // 美观输出
      commonLog("🆕 识别到新任务，正在自动创建环境与步骤...")
      
      let plan_id: number | null = null
      if (decision.new_plan_goal) {
        commonLog(`📋 创建任务计划，目标: ${decision.new_plan_goal}`)
        plan_id = TaskPlan.create({ goal: decision.new_plan_goal, status: 'todo' })
        commonLog(`✅ 任务计划已创建，plan_id: ${plan_id}`)
        
        if (Array.isArray(decision.steps) && decision.steps.length > 0) {
          commonLog(`📝 添加 ${decision.steps.length} 个计划步骤...`)
          decision.steps.forEach((stepText: string, index: number) => {
            commonLog(`  步骤 ${index + 1}: ${stepText}`)
            PlanStep.create({
              plan_id: plan_id as number,
              step: stepText,
              status: 'todo',
              result: "",
              step_order: index + 1
            })
          })
        }
      } else {
        commonLog(`ℹ️  未提供 new_plan_goal，不创建任务计划`)
      }
      
      const session_id = Session.create(decision.new_session_summary || "新会话", plan_id)
      return { level: decision.level, plan_id: plan_id || undefined, session_id }
    }

    return { 
      level: decision.level, 
      plan_id: decision.plan_id ? Number(decision.plan_id) : undefined, 
      session_id: decision.session_id ? Number(decision.session_id) : undefined 
    }

  } catch (e) {
    console.error("决策解析失败，退回保底逻辑:", e)
    return { level: 'base', session_id: await getLatestSessionId() }
  }
}