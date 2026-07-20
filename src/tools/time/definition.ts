import { ToolDefinition } from "../../types/tool.js"

export const timeToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "获取当前时间，包括日期、时间、星期、时区",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
]