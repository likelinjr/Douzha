import { ToolDefinition } from "../../types/tool.js"
import { getSessionDetail, listSessions } from "./tools.js"

export const historyToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "list_sessions",
      description: "列出所有历史对话的概览摘要，如果需要了解历史对话时，使用此工具获取概览",
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
      name: "get_session_detail",
      description: "查看某个历史对话的详细内容，需要先通过 list_sessions 获取对话后，再用此工具深入查看某个对话的具体内容，session_id 是 list_sessions 返回中对应对话的 ID",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "number", description: "要查看的对话 ID" },
          limit: { type: "number", description: "获取的消息条数，默认 10" },
          offset: { type: "number", description: "跳过的消息条数，默认 0 (用于分页)" }
        },
        required: ["session_id"]
      }
    }
  }
]

