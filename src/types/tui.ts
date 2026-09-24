type BaseMessage = {
  id: number
}

export type UserMessage = BaseMessage & {
  role: 'user'
  content: string
}

export type ThinkingStatus = 'thinking' | 'done'

export type AssistantMessage = BaseMessage & {
  role: 'assistant'
  content: string
  thinking: string
  thinkingStatus: ThinkingStatus
  thinkingDuration?: number
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
