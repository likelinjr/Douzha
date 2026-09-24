import { useState, useEffect } from 'react'
import { TextAttributes } from '@opentui/core'
import type { ToolMessage } from '../../../types/tui.js'
import { TUI_THEMES } from '../../../config/themes/colors.js'

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export function ToolMessageView({ content, toolStatus, result }: ToolMessage) {
  const [spinFrame, setSpinFrame] = useState(0)

  useEffect(() => {
    if (toolStatus !== 'loading') return
    const timer = setInterval(() => {
      setSpinFrame(f => (f + 1) % spinnerFrames.length)
    }, 80)
    return () => clearInterval(timer)
  }, [toolStatus])

  if (toolStatus === 'loading') {
    return (
      <box marginTop={1} marginX={2} flexDirection="row">
        <text fg={TUI_THEMES}>{spinnerFrames[spinFrame]}{'  '}{content}...</text>
      </box>
    )
  }

  if (toolStatus === 'error') {
    return (
      <box marginTop={1} marginX={2} flexDirection="row">
        <text>
          <span fg="red">{'✖  '}</span>
          <span fg="red">{content}</span>
          {/* {result && <span attributes={TextAttributes.DIM}>{' '}{result}</span>} */}
        </text>
      </box>
    )
  }

  return (
    <box marginTop={1} marginX={2} flexDirection="row">
      <text>
        <span attributes={TextAttributes.DIM}>{'✔  '}</span>
        <span attributes={TextAttributes.DIM}>{content}</span>
        {/* {result && <span attributes={TextAttributes.DIM}>{' '}{result}</span>} */}
      </text>
    </box>
  )
}
