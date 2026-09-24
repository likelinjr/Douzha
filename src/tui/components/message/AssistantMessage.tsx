import { useState, useEffect } from 'react'
import { TextAttributes } from '@opentui/core'
import type { AssistantMessage } from '../../../types/tui.js'
import { TUI_THEMES } from '../../../config/themes/colors.js'
import { MarkdownText } from './MarkdownText.js'

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function AssistantMessageView({ thinking, content, thinkingStatus, thinkingDuration }: AssistantMessage) {
  const [spinFrame, setSpinFrame] = useState(0)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (thinkingStatus !== 'thinking') return
    const timer = setInterval(() => {
      setSpinFrame(f => (f + 1) % spinnerFrames.length)
    }, 80)
    return () => clearInterval(timer)
  }, [thinkingStatus])

  return (
    <box flexDirection="column" marginX={2}>
      {thinkingStatus === 'thinking' && (
        <box flexDirection="column">
          <text
            fg={TUI_THEMES}
            selectable={true}
            onMouseUp={() => setExpanded(v => !v)}
            marginTop={1}
          >
            {spinnerFrames[spinFrame]}{expanded ? ' - Thinking' : ' Thinking'}
          </text>
          {expanded && thinking && (
            <text marginTop={1} attributes={TextAttributes.DIM}>{thinking.trim()}</text>
          )}
        </box>
      )}
      {thinkingStatus === 'done' && thinking && (
        <box flexDirection="column">
          <text
            selectable={true}
            onMouseUp={() => setExpanded(v => !v)}
            marginTop={1}
          >
            <span fg={TUI_THEMES}>{expanded ? '-' : '+'}{' Thought'}{thinkingDuration !== undefined ? `: ${thinkingDuration}ms` : ''}</span>
          </text>
          {expanded && (
            <text marginTop={1} attributes={TextAttributes.DIM}>{thinking.trim()}</text>
          )}
        </box>
      )}
      {content && <MarkdownText content={content} />}
    </box>
  )
}
