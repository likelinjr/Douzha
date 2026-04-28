import { think } from '../brain/index.js'
import { Message, AIResponse } from '../types/index.js'
import { toolHandlers } from '../tools/index.js'
import { loadMemory, saveMemory } from '../utils/memory.js'
import { getTaskPlan } from '../tools/plan/tools.js'

export async function run(userMessage: string) {

  const memory: Message[] = await loadMemory()
  memory.push({ role: 'user', content: userMessage })

  let isRunning = true
  let step = 1
  const MAX_STEPS = 100

  while (isRunning && step <= MAX_STEPS) {
    console.log(`\n--- 第 [${step}] 轮思考 ---`)

    const injectedPlan = await getTaskPlan() 
    const planAndMemory = [...memory] 
    if (injectedPlan && planAndMemory.length > 0) {
      const lastIndex = planAndMemory.length - 1
      planAndMemory[lastIndex] = { 
        ...planAndMemory[lastIndex], 
        content: planAndMemory[lastIndex].content + injectedPlan 
      }
    }
        
    const response: AIResponse = await think(planAndMemory)

    if (response.raw) {
      memory.push(response.raw)
      await saveMemory(memory)
    }

    if (response.action) {
      const { name, arguments: args, id } = response.action
      console.log(`🛠️ 执行工具: ${name}`)

      let toolResult = ""
      try {
        const handler = toolHandlers[name]
        if (handler) {
          toolResult = await handler(args)
        } else {
          toolResult = `❌ 未知工具: ${name}`
        }
      } catch (e: any) {
        toolResult = `❌ 执行失败: ${e.message}`
      }

      console.log(`📝 工具反馈: ${toolResult.substring(0, 100)}${toolResult.length > 100 ? '...' : ''}`)

      memory.push({ 
        role: 'tool', 
        tool_call_id: id,
        content: toolResult
      })
      await saveMemory(memory)

    } else {
      console.log(`\n✅ 任务完成！`)
      isRunning = false
    }

    step++
  }

  if (step > MAX_STEPS && isRunning) {
    console.warn("\n⚠️ 达到最大步数限制，任务强制中止。")
  }
}