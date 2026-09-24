import { useState, useCallback, useRef } from 'react'
import { run } from '../../core/engine.js'
import { type Message, type ToolMessage, type AssistantMessage } from '../../types/tui.js'
import { renderToolCall } from '../utils/render-tools.js'

export type Status = 'connecting' | 'deciding' | ''

export function useChat() {
  const [status, setStatus] = useState<Status>('')
  const [messages, setMessages] = useState<Message[]>([])
  const nextIdRef = useRef(1)

  const getNextId = useCallback(() => {
    const id = nextIdRef.current
    nextIdRef.current += 1
    return id
  }, [])

  const submitMessage = useCallback((input: string) => {
    if (input.trim().length === 0) return

    const submittedInput = input
    const userMsg: Message = { id: getNextId(), role: 'user', content: submittedInput }
    setMessages(prev => [...prev, userMsg])

    void (async () => {
      let isDeciding = true
      let currentAssistantMsgId: number | null = null
      // 跟踪 tool_call index -> ToolMessage id 的映射
      const pendingToolMsgIds: Map<number, number> = new Map()
      // 标记是否已进入过 tool_result 阶段，用于在新一轮流开始时清空 maps
      let hasToolResultPhase = false
      let thinkingStartTime: number | null = null

      const resetToolTracking = () => {
        pendingToolMsgIds.clear()
        hasToolResultPhase = false
      }

      const ensureAssistantMessage = () => {
        if (currentAssistantMsgId !== null) return currentAssistantMsgId

        const assistantMsgId = getNextId()
        currentAssistantMsgId = assistantMsgId
        setMessages(prev => [
          ...prev,
          { id: assistantMsgId, role: 'assistant', content: '', thinking: '', thinkingStatus: 'thinking' }
        ])
        return assistantMsgId
      }

      setStatus('connecting')
      try {
        for await (const event of run(submittedInput)) {
          if (
            isDeciding
            && (
              event.type === 'thinking'
              || event.type === 'content'
              || event.type === 'tool_call_delta'
              || event.type === 'tool_calls'
              || event.type === 'tool_result'
              || event.type === 'warn'
              || event.type === 'error'
            )
          ) {
            isDeciding = false
            setStatus('')
          }

          if (event.type === 'thinking') {
            if (hasToolResultPhase) resetToolTracking()
            const assistantMsgId = ensureAssistantMessage()
            if (thinkingStartTime === null) thinkingStartTime = Date.now()
            setMessages(prev => prev.map(m =>
              m.role === 'assistant' && m.id === assistantMsgId
                ? { ...m, thinking: m.thinking + event.chunk }
                : m
            ))
          } else {
            // 非 thinking 事件：结束思考计时
            if (thinkingStartTime !== null) {
              const duration = Date.now() - thinkingStartTime
              thinkingStartTime = null
              setMessages(prev => {
                const targetMsg = prev.find(m => m.role === 'assistant' && m.thinkingStatus === 'thinking')
                if (!targetMsg) return prev
                return prev.map(m =>
                  m.id === targetMsg.id
                    ? { ...m, thinkingStatus: 'done', thinkingDuration: duration }
                    : m
                )
              })
            }

            if (event.type === 'content') {
              if (hasToolResultPhase) resetToolTracking()
              const assistantMsgId = ensureAssistantMessage()
              setMessages(prev => prev.map(m =>
                m.role === 'assistant' && m.id === assistantMsgId
                  ? { ...m, content: m.content + event.chunk }
                  : m
              ))
            } else if (event.type === 'tool_call_delta') {
              if (hasToolResultPhase) resetToolTracking()
              const { index, name } = event
              if (name && !pendingToolMsgIds.has(index)) {
                const toolMsgId = getNextId()
                pendingToolMsgIds.set(index, toolMsgId)
                const displayContent = renderToolCall(name)
                const toolMsg: ToolMessage = {
                  id: toolMsgId,
                  role: 'tool',
                  content: displayContent,
                  toolStatus: 'loading',
                  toolName: name,
                }
                setMessages(prev => [...prev, toolMsg])
                currentAssistantMsgId = null
              }
            } else if (event.type === 'tool_calls') {
              // 更新或创建工具消息
              for (let i = 0; i < event.calls.length; i++) {
                const call = event.calls[i]
                let args: Record<string, unknown> | undefined
                try {
                  args = call.function.arguments ? JSON.parse(call.function.arguments) : undefined
                } catch { /* ignore parse error */ }
                const displayContent = renderToolCall(call.function.name, args)

                const existingMsgId = pendingToolMsgIds.get(i)
                if (existingMsgId !== undefined) {
                  // 更新已有消息的显示内容
                  setMessages(prev => prev.map(m =>
                    m.id === existingMsgId && m.role === 'tool'
                      ? { ...m, content: displayContent }
                      : m
                  ))
                } else {
                  // 创建新消息
                  const toolMsgId = getNextId()
                  pendingToolMsgIds.set(i, toolMsgId)
                  const toolMsg: ToolMessage = {
                    id: toolMsgId,
                    role: 'tool',
                    content: displayContent,
                    toolStatus: 'loading',
                    toolName: call.function.name,
                  }
                  setMessages(prev => [...prev, toolMsg])
                }
              }
              currentAssistantMsgId = null
            } else if (event.type === 'tool_result') {
              hasToolResultPhase = true
              const { index, result } = event
              const targetMsgId = pendingToolMsgIds.get(index)
              const isError = result?.isError === true
              const resultText = result?.content
                ?.filter(c => c.type === 'text')
                .map(c => c.text)
                .join('\n') || ''
              const displayResult = resultText.length > 80 ? resultText.slice(0, 80) + '...' : resultText

              if (targetMsgId !== undefined) {
                setMessages(prev => prev.map(m => {
                  if (m.id !== targetMsgId) return m
                  return {
                    ...m,
                    toolStatus: isError ? 'error' : 'success',
                    result: displayResult || undefined,
                  } as ToolMessage
                }))
              } else {
                const toolMsgId = getNextId()
                pendingToolMsgIds.set(index, toolMsgId)
                const toolMsg: ToolMessage = {
                  id: toolMsgId,
                  role: 'tool',
                  content: event.name,
                  toolStatus: isError ? 'error' : 'success',
                  toolName: event.name,
                  result: displayResult || undefined,
                }
                setMessages(prev => [...prev, toolMsg])
              }
            } else if (event.type === 'warn') {
              const warnMessage: Message = {
                id: getNextId(),
                role: 'warn',
                content: event.message
              }
              setMessages(prev => [...prev, warnMessage])
              currentAssistantMsgId = null
            } else if (event.type === 'error') {
              const errorMessage: Message = {
                id: getNextId(),
                role: 'error',
                content: event.message
              }
              setMessages(prev => [...prev, errorMessage])
              currentAssistantMsgId = null
            }
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const errorMessage: Message = {
          id: getNextId(),
          role: 'error',
          content: message
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        const duration = thinkingStartTime !== null ? Date.now() - thinkingStartTime : undefined
        setMessages(prev => {
          const targetMsg = prev.find(m => m.role === 'assistant' && m.thinkingStatus === 'thinking')
          if (!targetMsg) return prev
          return prev.map(m =>
            m.id === targetMsg.id
              ? { ...m, thinkingStatus: 'done', thinkingDuration: duration }
              : m
          )
        })
        setStatus('')
      }
    })()
  }, [getNextId])

  return {
    status,
    messages,
    submitMessage
  }
}
