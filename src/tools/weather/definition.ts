import { ToolDefinition } from "../../types/tool.js"

export const weatherToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "获取指定城市的当前天气信息，包括温度、天气现象、风力及湿度等。支持中国及全球主要城市名称。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '北京'、'上海' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  }
]