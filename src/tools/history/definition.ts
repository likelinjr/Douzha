import { ToolDefinition } from "../../types/tool.js"

export const historyToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "list_sessions",
      description: "列出所有历史会话的概览摘要。当用户想了解历史记录时，优先使用此工具获取概览",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_history_detail",
      description: "查看某个具体历史会话的详细对话内容。需要先通过 list_sessions 知道有哪些会话后，再用此工具深入查看某个会话的具体聊天记录。session_id 填 list_sessions 返回中对应会话的真实 ID。",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "number", description: "要查看的会话 ID（从 list_sessions 获取）" },
          plan_id: { type: "number", description: "关联的计划 ID（可选）" },
          limit: { type: "number", description: "获取的消息条数，默认 10" },
          offset: { type: "number", description: "跳过的消息条数，默认 0（用于分页）" }
        },
        required: ["session_id"]
      }
    }
  }
]