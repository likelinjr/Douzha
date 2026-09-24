import { think } from '../brain/models/index.js'
import { Message } from '../types/message.js'
import { ToolCall,ToolResult } from '../types/tool.js'
import { allToolsDefinition, toolHandlers } from '../tools/index.js'
import { getTaskPlan } from '../tools/plan/tools.js'
import { getSystemPrompt } from '../brain/prompt.js'
import { loadMemory, getLatestFullContext, saveMemory, getLatestSession } from '../utils/memory.js'
import { Session } from '../database/historyMsg_dbTools.js'
import { toolLog, commonLog, warnLog, errorLog, model_content, model_reasoning } from '../utils/debug.js'
import { BASE_MODEL } from '../brain/models/config.js'
import { eventType } from '../types/events.js'

export async function* run(
  userMessage: string,
): AsyncIterableIterator<eventType> {
  const memory = await loadMemory()
  const messages: Message[] = [{ role: 'user', content: userMessage }]
  const systemPrompt = getSystemPrompt()
  const latestSession = await getLatestSession()
  const session_id = latestSession?.id || Session.create("新对话", null)
  const plan_id = latestSession?.plan_id ?? undefined
  const recentContext = await getLatestFullContext()
  const modelConfig = BASE_MODEL

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
  const MAX_STEPS = 50

  while (isRunning && step <= MAX_STEPS) {
    commonLog(`\n第 ${step} 次请求\n\n`)
    const planInfo = await getTaskPlan({ planId: Number(plan_id), sessionId: Number(session_id) })
    const dynamicSystemPrompt = `${systemPrompt}\n\n${memory}\n\n${recentContext}\n\n${planInfo}`

    // 迭代模型返回的事件流
    const eventStream = think(
      modelConfig,
      messages,
      allToolsDefinition,
      dynamicSystemPrompt
    )

    let fullContent = ''
    let fullReasioningContent = '' 
    let toolCalls: ToolCall[] = []
    let isThinking = false

    for await (const event of eventStream) {
      if (event.type === 'thinking') {
        isThinking = true
        model_reasoning(event.chunk)
        fullReasioningContent += event.chunk
        yield event
      } else if (event.type === 'content') {
        isThinking && ( commonLog("\n\n"), isThinking = false )
        model_content(event.chunk)
        fullContent += event.chunk
        yield event
      } else if (event.type === 'tool_call_delta') {
        yield event
      } else if (event.type === 'tool_calls') {
        toolCalls = event.calls
        yield event
      } else if (event.type === 'error') {
        yield event
        errorLog(`\n\n${ event.message }`)
        isRunning = false
        break
      } else if (event.type === 'warn') {
        yield event
        warnLog(`\n\n${ event.message }`)
        isRunning = false
        break
      } else if(event.type === 'usage') {
        commonLog(`\n\n${event.metrics}`)
        // yield event
      } else if (event.type === 'done') {
        break
      }
    }

    messages.push({
      role: 'assistant',
      content: fullContent,
      reasoning_content: fullReasioningContent,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    })

    await saveMemory({
      session_id: Number(session_id),
      role: 'assistant',
      content: fullContent,
      reasoning_content: fullReasioningContent,
      tool_calls: toolCalls ? JSON.stringify(toolCalls) : null,
      tool_call_id: null
    })

    if (toolCalls && toolCalls.length > 0) {
      toolLog(`\n\n📋 ${modelConfig.modelName} 返回 ${toolCalls.length} 个工具调用`)
      
      for (let i = 0; i < toolCalls.length; i++) {
        const toolCall = toolCalls[i]
        const { id, function: { name, arguments: argsStr } } = toolCall
        const args = JSON.parse(argsStr)

        const formatValue = (v: unknown): string => {
          const s = typeof v === 'object' ? JSON.stringify(v) : typeof v === 'string' ? `"${v}"` : String(v)
          return s.length > 100 ? s.slice(0, 100) + '...' : s
        }
        const formattedArgs = Object.entries(args).map(([k, v]) => `${k}=${formatValue(v)}`).join(', ')

        toolLog(`\n\n执行工具: ${name}(${formattedArgs})`)
        
        let toolResult: ToolResult | null = null

        try {
          const handler = toolHandlers[name]
          if (handler) {
            if (name === 'update_task_plan' && plan_id) {
              args.plan_id = Number(plan_id)
            }
            toolResult = await handler(args)
            toolLog(`\n\n工具反馈: ${ JSON.stringify(toolResult) }`)
          } else {
            toolResult = {
              content: [{ type: "text", text: `❌ 未知工具: ${name}` }],
              isError: true
            }
            toolLog(`\n\n工具反馈: ${ JSON.stringify(toolResult) }`)
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : String(error)
          toolResult = {
            content: [{ type: "text", text: `❌ 执行失败: ${message}` }],
            isError: true
          }
          toolLog(`\n\n工具反馈: ${ JSON.stringify(toolResult)}`)
        }

        // 发送工具结果事件
        yield { type: 'tool_result', name, index: i, result: toolResult }

        messages.push({
          role: 'tool',
          tool_call_id: id,
          content: JSON.stringify(toolResult.content)
        })
        await saveMemory({
          session_id: Number(session_id),
          role: 'tool',
          content: JSON.stringify(toolResult),
          reasoning_content: null,
          tool_calls: null,
          tool_call_id: id
        })
      }
    } else {
      commonLog(`\n\n✅ 对话结束！\n\n`)
      isRunning = false
    }
    step++
  }

  if (step > MAX_STEPS && isRunning) {
    warnLog("\n\n⚠️ 达到最大步数限制，任务强制中止 \n\n")
    yield { type: 'warn', message: "⚠️ 达到最大步数限制，任务强制中止" }
  }

  yield { type: 'done' }
}

 
export async function runSimple(userMessage: string): Promise<void> {
  for await (const _ of run(userMessage)) {}
}
