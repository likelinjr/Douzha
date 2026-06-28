import { Role } from './message.js'

export interface SessionRow {
    id: number;
    summary: string | null;
    plan_id: number | null;
    created_at: string;
}

export interface MessageRow {
    id?: number;
    session_id: number;
    role: Role;       
    content: string | null
    reasoning_content: string | null
    tool_calls: string | null
    tool_call_id: string | null
    created_at?: string;
}