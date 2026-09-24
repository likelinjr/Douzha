import { useState, useRef, useEffect } from 'react'
import { useTerminalDimensions } from '@opentui/react'
import type { ScrollBoxRenderable } from '@opentui/core'
import { Banner } from './components/Banner.js'
import { StatusLine } from './components/StatusLine.js'
import { Messages } from './components/message/index.js'
import { InputBox } from './components/InputBox.js'
import { useChat } from './hooks/useChat.js'

export function App() {
  const [ready, setReady] = useState(false)
  const { status, messages, submitMessage } = useChat()
  const { height } = useTerminalDimensions()
  const scrollRef = useRef<ScrollBoxRenderable>(null)

  const toBottom = () => {
    const box = scrollRef.current
    if (!box) return
    box.scrollTo({ x: 0, y: box.scrollHeight })
  }

  useEffect(() => {
    toBottom()
  }, [messages, status])

  return (
    <box flexDirection="column" height={height}>
      <scrollbox
        ref={scrollRef}
        flexGrow={1}
        stickyScroll={true}
        stickyStart="bottom"
      >
        <box height={1} />
        <Banner onDone={() => setReady(true)} />
        {ready && <Messages messages={messages} />}
        <StatusLine status={status} />
      </scrollbox>
      <box height={2} />
      {ready && <InputBox onSubmit={submitMessage} />}
    </box>
  )
}
