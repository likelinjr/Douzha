import React, { useState, useCallback } from 'react'
import { Box, Newline, Text, useApp, useInput } from 'ink'
import { Banner } from './components/Banner.js'
import { StatusLine } from './components/StatusLine.js'
import { Messages } from './components/Messages.js'
import { useChat } from './hooks/useChat.js'

export function App() {
  const [ready, setReady] = useState(false)
  const [input, setInput] = useState('')
  const { status, messages, submitMessage } = useChat()
  const { exit } = useApp()

  const onInput = useCallback((ch: string, key: { return?: boolean; escape?: boolean; backspace?: boolean; delete?: boolean; ctrl?: boolean; meta?: boolean }) => {
    if (!ready) return
    if (key.escape || (key.ctrl && ch === 'c')) { exit(); return }
    if (ch.toLowerCase() === 'q' && input.length === 0) { exit(); return }

    if (key.return) {
      if (input.trim().length > 0) {
        submitMessage(input)
        setInput('')
      }
      return
    }

    if (key.backspace || key.delete) { setInput(prev => prev.slice(0, -1)); return }
    if (!key.ctrl && !key.meta && ch) { setInput(prev => prev + ch) }
  }, [ready, input, exit, submitMessage])

  useInput(onInput)

  return (
    <Box flexDirection="column">
      <Banner onDone={() => setReady(true)} />

      {ready && (
        <>
          <Box flexGrow={1} flexDirection="column" >
            <Messages messages={messages} />
          </Box>
          <Box >
            <StatusLine status={status} />
          </Box>
          <Box paddingTop={1}>
            <Text bold color="cyan">{'>> '}</Text>
            <Text>{input}</Text>
            <Text dimColor>▎</Text>
          </Box>
        </>
      )}
    </Box>
  )
}
