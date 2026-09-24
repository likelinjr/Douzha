import { createNewTaskPlan, getTaskPlan, updateTaskPlan } from './tools.js'
import { dbManager } from '../../database/database.js'
import { Session } from '../../database/historyMsg_dbTools.js'
import { PlanStep } from '../../database/plan_dbTools.js'

async function test() {
  console.log('=== 测试计划工具 ===\n')

  // 测试1: createNewTaskPlan
  console.log('--- 测试 createNewTaskPlan ---')
  const createResult = await createNewTaskPlan('完成项目部署', [
    { step: '编写Dockerfile', status: 'todo', result: '' },
    { step: '配置CI/CD流水线', status: 'todo', result: '' },
    { step: '部署到生产环境', status: 'todo', result: '' },
  ])
  console.log('创建结果:', createResult)

  const resultText = createResult.content[0]?.type === 'text' ? createResult.content[0].text : ''
  const planIdMatch = resultText.match(/PLAN_ID: (\d+)/)
  const planId = planIdMatch ? Number(planIdMatch[1]) : null
  console.log('提取 planId:', planId)

  // 测试2: getTaskPlan (通过 planId)
  console.log('\n--- 测试 getTaskPlan (通过 planId) ---')
  const planInfo = await getTaskPlan({ planId: planId! })
  console.log('查询结果:', planInfo)

  // 测试3: 创建 session 关联 plan，然后通过 sessionId 查询
  console.log('\n--- 测试 getTaskPlan (通过 sessionId) ---')
  const sessionId = Session.create('测试会话', planId)
  const planBySession = await getTaskPlan({ sessionId })
  console.log('通过sessionId查询结果:', planBySession)

  // 测试4: updateTaskPlan
  // 真实场景: AI 只传 updates（step_order/status/可选result），plan_id 由引擎层注入
  console.log('\n--- 测试 updateTaskPlan ---')
  const updateResult = await updateTaskPlan(planId!, [
    { step_order: 1, status: 'done', result: 'Dockerfile已编写完成' },
    { step_order: 2, status: 'doing' },
  ])
  console.log('更新结果:', updateResult)

  // 测试5: 更新后再次查询验证
  console.log('\n--- 测试更新后查询 ---')
  const updatedPlan = await getTaskPlan({ planId: planId! })
  console.log('更新后的计划:', updatedPlan)

  // 测试6: 边界情况 - 无效 planId
  console.log('\n--- 测试边界情况 (无效planId) ---')
  const emptyPlan = await getTaskPlan({ planId: 99999 })
  console.log('无效planId查询结果:', emptyPlan || '(空)')

  // 清理测试数据
  console.log('\n--- 清理测试数据 ---')
  PlanStep.getByPlanId(planId!).forEach(s => PlanStep.delete(s.id!))
  Session.delete(sessionId)
  console.log('测试数据已清理')

  // 关闭数据库
  dbManager.db.close()
  console.log('\n=== 测试完成 ===')
}

test().catch(e => {
  console.error('测试失败:', e)
  dbManager.db.close()
})
