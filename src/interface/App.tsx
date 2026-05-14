import React, { useState, useCallback, useRef } from 'react'
import { Box, Text, useApp, useInput } from 'ink'
import { Banner } from './components/Banner.js'
import { StatusLine } from './components/StatusLine.js'
import { Messages, type Message } from './components/Messages.js'
import { run } from '../core/engine.js'

type Status = 'idle' | 'thinking' | 'working'

export function App() {
  const [ready, setReady] = useState(false)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [nextId, setNextId] = useState(1)
  const currentMsgIdRef = useRef<number>(0)
  const { exit } = useApp()

  const onInput = useCallback((ch: string, key: { return?: boolean; escape?: boolean; backspace?: boolean; delete?: boolean; ctrl?: boolean; meta?: boolean }) => {
    if (!ready) return
    if (key.escape || (key.ctrl && ch === 'c')) { exit(); return }
    if (ch.toLowerCase() === 'q' && input.length === 0) { exit(); return }

    if (key.return) {
      if (input.trim().length > 0) {
        const userMsg: Message = { id: nextId, role: 'user', content: input }
        const assistantMsgId = nextId + 1
        const assistantMsg: Message = { id: assistantMsgId, role: 'assistant', content: '', thinking: '' }
        setMessages(prev => [...prev, userMsg, assistantMsg])
        setNextId(prev => prev + 2)
        currentMsgIdRef.current = assistantMsgId
        setStatus('thinking')
        setInput('')

        run(input, {
          onThinking: (text) => {
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId ? { ...m, thinking: (m.thinking || '') + text } : m
            ))
          },
          onContent: (text) => {
            setStatus('working')
            setMessages(prev => prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: m.content + text } : m
            ))
          }
        }).then(() => {
          setStatus('idle')
        }).catch((err: any) => {
          setMessages(prev => prev.map(m =>
            m.id === assistantMsgId ? { ...m, content: `❌ 错误: ${err.message}` } : m
          ))
          setStatus('idle')
        })
      }
      return
    }

    if (key.backspace || key.delete) { setInput(prev => prev.slice(0, -1)); return }
    if (!key.ctrl && !key.meta && ch) { setInput(prev => prev + ch) }
  }, [ready, input, exit, nextId])

  useInput(onInput)

  return (
    <Box flexDirection="column">
      <Banner onDone={() => setReady(true)} />

      {ready && (
        <>
          <Box flexGrow={1} flexDirection="column" paddingX={1}>
            <Messages messages={messages} />
          </Box>
          <Box paddingX={1}>
            <StatusLine status={status} />
          </Box>
          <Box paddingX={1}>
            <Text bold color="cyan">{'> '}</Text>
            <Text>{input}</Text>
            <Text dimColor>▎</Text>
          </Box>
        </>
      )}
    </Box>
  )
}
