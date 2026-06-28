import { ToolDefinition } from "../../types/tool.js"

export const planToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "update_task_plan",
      description: "更新任务计划的进度。当你完成或开始某个步骤时，调用此工具。你需要提供步骤的序号（1, 2, 3...）以及最新的状态。",
      parameters: {
        type: "object",
        properties: {
          updates: {
            type: "array",
            description: "需要更新的步骤列表",
            items: {
              type: "object",
              properties: {
                step_order: { type: "number", description: "步骤的序号（从 1 开始）" },
                status: { 
                  type: "string", 
                  enum: ["todo", "doing", "done", "failed"] 
                },
                result: { type: "string", description: "该步骤执行后的结果简述" }
              },
              required: ["step_order", "status"]
            }
          }
        },
        required: ["updates"]
      }
    }
  }
]