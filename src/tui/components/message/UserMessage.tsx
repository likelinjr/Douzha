import type { UserMessage } from '../../../types/tui.js'
import { TUI_THEMES } from '../../../config/themes/colors.js'

export function UserMessageView({ content }: UserMessage) {
  return (
    <box marginTop={1} border={['left']} borderColor={TUI_THEMES} customBorderChars={{ vertical: '┃', topLeft: '', bottomLeft: '', horizontal: ' ', topRight: '', bottomRight: '', cross: '', leftT: '', rightT: '', topT: '', bottomT: '' }}>
      <box paddingLeft={2} paddingRight={2} paddingTop={1} paddingBottom={1} backgroundColor="#252525">
        <text fg="white">{content}</text>
      </box>
    </box>
  )
}
