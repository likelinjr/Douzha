import { ToolDefinition } from "../../types/tool.js"

export const sessionToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function:{
      name: "create_new_session",
      description: "创建一个新的会话。如果你之前通过 sync_task_plan 创建了计划，请务必传入获取到的 plan_id。",
      parameters: {
        type: "object",
        properties: {
          summary: { type: "string", description: "会话标题总结" },
          plan_id: { type: "number", description: "关联的计划 ID（如果有）" }
        },
        required: ["summary"]
      }
    }
  }
]