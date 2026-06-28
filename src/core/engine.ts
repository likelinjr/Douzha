import { think } from '../brain/models/index.js'
import { Message, AIResponse } from '../types/message.js'
import { allToolsDefinition, toolHandlers } from '../tools/index.js'
import { getTaskPlan } from '../tools/plan/tools.js'
import { getSystemPrompt } from '../brain/prompt.js'
import { runDecision } from '../brain/decisionMaker.js'
import { loadMemory, getRecentContext, getLatestFullContext, saveMemory } from '../utils/memory.js'
import { toolLog, commonLog, DEBUG } from '../utils/debug.js'
import { ADVANCED_MODEL, BASE_MODEL } from '../brain/models/modelConfig.js'

export async function run(
  userMessage: string, 
  options?: { onContent?: (text: string) => void; onThinking?: (text: string) => void }
) {
  const memory = await loadMemory()
  const { intent, level, plan_id, session_id, remark } = await runDecision(userMessage)

  const recentContext = intent === 'continue' && session_id 
    ? await getLatestFullContext() 
    : await getRecentContext()
  const modelConfig = level === 'advanced' 
    ? ADVANCED_MODEL 
    : BASE_MODEL
  const messages: Message[] = [{ role: 'user', content: userMessage }]

  await saveMemory({
    session_id: Number(session_id),
    role: 'user',
    content: userMessage,
    reasoning_content: null,
    tool_calls: null,
    tool_call_id: null
  })

  let isRunning = true
  let step = 1
  let finalAnswer = ''
  const MAX_STEPS = 300

  while (isRunning && step <= MAX_STEPS) {

    commonLog(`\n第 ${step} 次请求\n`)

    const planInfo = await getTaskPlan({ planId: Number(plan_id), sessionId: Number(session_id) })
    const remarkSection = remark ? `\n# 备注\n${remark}` : ''
    const dynamicSystemPrompt = `${getSystemPrompt()}\n\n${memory}\n\n${recentContext}\n\n${planInfo}${remarkSection}`
    const response: AIResponse = await think(
      modelConfig,
      messages,
      allToolsDefinition, 
      dynamicSystemPrompt,
      options
    ) 

    if (response.raw) {
      messages.push(response.raw),
      await saveMemory({
        session_id: Number(session_id),
        role: response.raw.role,
        content: response.raw.content,
        reasoning_content: response.raw.reasoning_content || null,
        tool_calls: response.raw.tool_calls ? JSON.stringify(response.raw.tool_calls) : null,
        tool_call_id: null
      })
    }

    if (response.actions && response.actions.length > 0) {
      commonLog(`\n收到 ${response.actions.length} 个并行工具调用`)
      for (const action of response.actions) {
        const { name, arguments: args, id } = action
        toolLog(`\n执行工具: ${name}\n`)

        let toolResult = ""
        try {
          const handler = toolHandlers[name]
          if (handler) {
            if (name === 'update_task_plan' && plan_id) {
              args.plan_id = Number(plan_id)
            }
            toolResult = await handler(args)
          } else {
            toolResult = `❌ 未知工具: ${name}`
          }
        } catch (e: any) {
          toolResult = `❌ 执行失败: ${e.message}`
        }

        toolLog(`工具反馈: ${toolResult.substring(0, 100)}${toolResult.length > 100 ? '...' : ''}`)

        messages.push({ 
          role: 'tool', 
          tool_call_id: id,
          content: toolResult
        })

        await saveMemory({
          session_id: Number(session_id),
          role: 'tool',
          content: toolResult,
          reasoning_content: null,
          tool_calls: null,
          tool_call_id: id
        })
      }

    } else {
      
      commonLog(`\n\n✅ 任务完成！\n`)
      !DEBUG && console.log('\n')

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