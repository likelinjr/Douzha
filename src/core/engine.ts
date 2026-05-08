import { think } from '../brain/index.js'
import { Message, AIResponse } from '../types/index.js'
import { allToolsDefinition, toolHandlers } from '../tools/index.js'
import { getTaskPlan } from '../tools/plan/tools.js'
import { getSystemPrompt } from '../brain/prompt.js'
import { runDecision } from '../brain/decisionMaker.js'
import { Message as MessageDB } from '../database/dbTools.js'
import { loadMemory, getRecentContext } from '../utils/memory.js'
import { toolLog, commonLog, DEBUG_CHAT } from '../utils/debug.js'

export async function run(userMessage: string) {

  const memory = await loadMemory()
  const memoryString = `[系统内部参考 - 历史会话索引（仅供你理解上下文使用，切勿向用户展示ID或原样输出）]\n` + memory
  const recentContext = await getRecentContext()

  const { level, plan_id, session_id } = await runDecision(userMessage)

  const selectedModel = level === 'advanced' 
    ? (process.env.ADVANCED_MODEL || 'deepseek') 
    : (process.env.BASE_MODEL || 'gemini')

  const sessionMessages: Message[] = [{ role: 'user', content: userMessage }]

  await MessageDB.create({
    session_id: Number(session_id),
    role: 'user',
    content: userMessage,
    tool_calls: null,
    tool_call_id: null
  })

  let isRunning = true
  let step = 1
  let finalAnswer = ''
  const MAX_STEPS = 50

  while (isRunning && step <= MAX_STEPS) {

    DEBUG_CHAT && console.log("") // 美观输出
    commonLog(`--- 第 [${step}] 轮思考 ---`)

    const planInfo = await getTaskPlan({ planId: Number(plan_id), sessionId: Number(session_id) })
    const dynamicSystemPrompt = `${getSystemPrompt()}\n\n${memoryString}\n\n${recentContext}\n\n${planInfo}`
    const response: AIResponse = await think(
      sessionMessages,
      allToolsDefinition, 
      dynamicSystemPrompt,
      selectedModel
    ) 

    if (response.raw) {
      sessionMessages.push(response.raw),
      await MessageDB.create({
        session_id: Number(session_id),
        role: response.raw.role,
        content: response.raw.content,
        tool_calls: response.raw.tool_calls ? JSON.stringify(response.raw.tool_calls) : null,
        tool_call_id: null
      })
    }

    if (response.actions && response.actions.length > 0) {
      commonLog(`🔧 收到 ${response.actions.length} 个并行工具调用`)
      for (const action of response.actions) {
        const { name, arguments: args, id } = action
        toolLog(`🛠️ 执行工具: ${name}`)

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

        toolLog(`📝 工具反馈: ${toolResult.substring(0, 100)}${toolResult.length > 100 ? '...' : ''}`)

        sessionMessages.push({ 
          role: 'tool', 
          tool_call_id: id,
          content: toolResult
        })
        await MessageDB.create({
          session_id: Number(session_id),
          role: 'tool',
          content: toolResult,
          tool_calls: null,
          tool_call_id: id
        })
      }

    } else {
      
      console.log("\n") // 美观输出
      commonLog(`✅ 任务完成！`)
      DEBUG_CHAT && console.log("") // 美观输出

      finalAnswer = response.answer || ''
      isRunning = false
    }
    step++
  }

  if (step > MAX_STEPS && isRunning) {
    console.warn("\n⚠️ 达到最大步数限制，任务强制中止。")
  }

  return finalAnswer
}