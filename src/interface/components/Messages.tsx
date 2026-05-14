import React from 'react'
import { Box, Text, Newline } from 'ink'

export type MessageRole = 'user' | 'assistant'

export type Message = {
  id: number
  role: MessageRole
  content: string
  thinking?: string
}

type Props = {
  messages: Message[]
}

function UserMessage({ content }: { content: string }) {
  return (
    <Box flexDirection="column" marginBottom={1} paddingX={1}>
      <Text bold color="cyan">{'> '}{content}</Text>
    </Box>
  )
}

function AssistantMessage({ message }: { message: Message }) {
  return (
    <Box flexDirection="column" marginBottom={1} paddingX={1}>
      {message.thinking && (
        <>
          <Text dimColor>{message.thinking}</Text>
        </>
      )}
      <Text>{message.content || ''}</Text>
    </Box>
  )
}

export function Messages({ messages }: Props) {
  if (messages.length === 0) return null

  return (
    <Box flexDirection="column">
      {messages.map(msg => (
        msg.role === 'user'
          ? <UserMessage key={msg.id} content={msg.content} />
          : <AssistantMessage key={msg.id} message={msg} />
      ))}
    </Box>
  )
}
