export type Role = 'user' | 'assistant' | 'tool'

export interface ToolCall {
    id: string
    type?: 'function'
    function: {
        name: string
        arguments: string
    }
}

export interface Message {
    role: Role;
    content: string | null 
    reasoning_content?: string
    tool_calls?: ToolCall[]
    tool_call_id?: string
}

export interface ToolAction {
    id: string;
    name: string
    arguments: any
}

export interface AIResponse {
    actions?: ToolAction[]
    answer?: string | null
    raw?: Message
}

