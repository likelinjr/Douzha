import { TextAttributes } from '@opentui/core'
import type { Message, WarnMessage, ErrorMessage } from '../../../types/tui.js'
import { UserMessageView } from './UserMessage.js'
import { AssistantMessageView } from './AssistantMessage.js'
import { ToolMessageView } from './ToolMessage.js'

export type { Message, UserMessage, AssistantMessage, ToolMessage, ToolStatus, WarnMessage, ErrorMessage } from '../../../types/tui.js'

function WarnMessageView({ content }: WarnMessage) {
  return (
    <box marginTop={1} marginX={2}>
      <text fg="yellow">警告: {content}</text>
    </box>
  )
}

function ErrorMessageView({ content }: ErrorMessage) {
  return (
    <box marginTop={1} marginX={2}>
      <text fg="red">错误: {content}</text>
    </box>
  )
}

type Props = {
  messages: Message[]
}

export function Messages({ messages }: Props) {
  if (messages.length === 0) return null

  return (
    <box flexDirection="column">
      {messages.map(msg => {
        if (msg.role === 'user') {
          return <UserMessageView key={msg.id} {...msg} />
        }
        if (msg.role === 'assistant') {
          return <AssistantMessageView key={msg.id} {...msg} />
        }
        if (msg.role === 'tool') {
          return <ToolMessageView key={msg.id} {...msg} />
        }
        if (msg.role === 'warn') {
          return <WarnMessageView key={msg.id} {...msg} />
        }
        return <ErrorMessageView key={msg.id} {...msg} />
      })}
    </box>
  )
}
