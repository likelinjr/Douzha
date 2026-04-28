import { ToolDefinition } from "../../types/tool.js"

export const planToolsDefinition :ToolDefinition[] = [{
  type: "function",
  function: {
    name: "sync_task_plan",
    description: "任务步骤的详细列表。注意：必须严格以数组（Array）格式传入。 每个步骤对象应包含：task (具体动作描述), status (状态：todo/doing/done), result (该步骤产出的关键结论或文件路径)。",
    parameters: {
      type: "object",
      properties: {
        goal: { type: "string", description: "总目标描述" },
        plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              task: { type: "string", description: "该步骤要做什么" },
              status: { type: "string", enum: ["todo", "doing", "done"] },
              result: { type: "string", description: "该步骤执行后的简要结果" }
            }
          }
        }
      },
      required: ["goal", "plan"]
    }
  }
}
]