export interface ToolCall {
    id: string
    type: 'function'
    function: {
        name: string
        arguments: string
    }
}

export type Role = 'user' | 'assistant' | 'tool'

export interface UserMessage {
    role: 'user';
    content: string;
}

export interface AssistantMessage {
    role: 'assistant';
    content: string;
    reasoning_content?: string;
    tool_calls?: ToolCall[];
}

export interface ToolMessage {
    role: 'tool';
    content: string;
    tool_call_id: string;
}

export type Message = UserMessage | AssistantMessage | ToolMessage

export interface ToolAction {
    id: string;
    name: string
    arguments: any
}

export interface AIResponse {
    actions?: ToolAction[]
    answer?: string | null
    raw?: AssistantMessage
}

