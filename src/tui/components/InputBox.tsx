import { useState, useRef, useCallback } from 'react'
import type { TextareaRenderable } from '@opentui/core'
import { TextAttributes } from '@opentui/core'
import { TUI_THEMES } from '../../config/themes/colors.js'
import { BASE_MODEL } from '../../brain/models/config.js'

type Props = {
  onSubmit: (input: string) => void
}

const placeholders = [
  '输入你的问题...',
  '有什么可以帮你的？',
  '试试问我点什么',
]

export function InputBox({ onSubmit }: Props) {
  const inputRef = useRef<TextareaRenderable>(null)
  const [placeholder] = useState(() => placeholders[Math.floor(Math.random() * placeholders.length)])

  const handleSubmit = useCallback(() => {
    const textarea = inputRef.current
    if (!textarea) return
    const text = textarea.plainText
    if (text.trim().length === 0) return
    onSubmit(text)
    textarea.clear()
  }, [onSubmit])

  return (
    <box flexDirection="column" flexShrink={0}>
      <box border={['left']} borderColor={TUI_THEMES} customBorderChars={{ vertical: '┃', topLeft: '', bottomLeft: '', horizontal: ' ', topRight: '', bottomRight: '', cross: '', leftT: '', rightT: '', topT: '', bottomT: '' }}>
        <box paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1} backgroundColor="#252525">
          <textarea
            ref={inputRef}
            placeholder={placeholder}
            placeholderColor="gray"
            minHeight={1}
            maxHeight={6}
            focused={true}
            keyBindings={[
              { name: "return", action: "submit" },
              { name: "return", ctrl: true, action: "newline" },
            ]}
            onSubmit={handleSubmit}
            onKeyDown={(key) => {
              if (key.name === 'escape' || (key.ctrl && key.name === 'c')) { process.exit(0); }
              if (key.name === 'q' && inputRef.current && inputRef.current.plainText.length === 0) { process.exit(0); }
            }}
          />
        </box>
      </box>
      <box flexDirection="row" paddingLeft={2}>
        <text fg="gray" attributes={TextAttributes.DIM}>
          {BASE_MODEL.modelName}
          <span> · </span>
          ESC 退出
        </text>
      </box>
    </box>
  )
}
