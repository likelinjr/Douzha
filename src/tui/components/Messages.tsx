import React from 'react'
import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'

type BaseMessage = {
  id: number
}

export type UserMessage = BaseMessage & {
  role: 'user'
  content: string
}

export type AssistantMessage = BaseMessage & {
  role: 'assistant'
  content: string
  thinking: string
}

export type ToolStatus = 'loading' | 'success' | 'error'

export type ToolMessage = BaseMessage & {
  role: 'tool'
  content: string
  toolStatus: ToolStatus
  toolName: string
  result?: string
}

export type WarnMessage = BaseMessage & {
  role: 'warn'
  content: string
}

export type ErrorMessage = BaseMessage & {
  role: 'error'
  content: string
}

export type Message = UserMessage | AssistantMessage | ToolMessage | WarnMessage | ErrorMessage

type Props = {
  messages: Message[]
}

function UserMessageView({ content }: UserMessage) {
  return (
    <Box flexDirection="column" marginTop={1} >
      <Text bold color="cyan">{'>> '}{content}</Text>
    </Box>
  )
}

function AssistantMessageView({ thinking, content }: AssistantMessage) {
  return (
    <Box flexDirection="column" marginTop={1} marginX={2} >
      {thinking && (
        <Text dimColor>{thinking.trim()}</Text>
      )}
      {content && <Text>{content}</Text>}
    </Box>
  )
}

function ToolMessageView({ content, toolStatus, result }: ToolMessage) {
  if (toolStatus === 'loading') {
    return (
      <Box marginTop={1} marginX={2}>
        <Box marginRight={2}>
          <Text color="cyan"><Spinner type="arc" /></Text>
        </Box>
        <Text color="cyan">{content}...</Text>
      </Box>
    )
  }

  if (toolStatus === 'error') {
    return (
      <Box marginTop={1} marginX={2}>
        <Box marginRight={2}>
          <Text color="red">✖</Text>
        </Box>
        <Box marginRight={2}>
          <Text color="red">{content}</Text>
        </Box>
        {result && <Text dimColor>{result}</Text>}
      </Box>
    )
  }

  return (
    <Box marginTop={1} marginX={2}>
      <Box marginRight={2}>
        <Text color="green" bold>✔</Text>
      </Box>
      <Box marginRight={2}>
        <Text color="green">{content}</Text>
      </Box>
      {result && <Text dimColor>{result}</Text>}
    </Box>
  )
}

function WarnMessageView({ content }: WarnMessage) {
  return (
    <Box flexDirection="column" marginTop={1} marginX={2} >
      <Text color="yellow">警告: {content}</Text>
    </Box>
  )
}

function ErrorMessageView({ content }: ErrorMessage) {
  return (
    <Box flexDirection="column" marginTop={1} marginX={2} >
      <Text color="red">错误: {content}</Text>
    </Box>
  )
}

export function Messages({ messages }: Props) {
  if (messages.length === 0) return null

  return (
    <Box flexDirection="column">
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
    </Box>
  )
}
