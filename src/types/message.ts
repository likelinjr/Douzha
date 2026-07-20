import { ToolCall } from './tool.js'

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