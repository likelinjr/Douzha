import { ToolCall, ToolResult } from "./tool.js"

export type eventType = { type: 'thinking'; chunk: string }
  | { type: 'content'; chunk: string }
  | { type: 'tool_call_delta'; index: number; id?: string; name?: string; arguments?: string }
  | { type: 'tool_calls'; calls: Array<ToolCall> }
  | { type: 'tool_result'; name: string; index: number; result: ToolResult | null }
  | { type: 'warn'; message: string }
  | { type: 'error'; message: string }
  | { type: 'usage'; metrics: string }
  | { type: 'done' }
