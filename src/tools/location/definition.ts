import { ToolDefinition } from "../../types/tool.js"

export const locationToolsDefinition :ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_user_location",
      description: "获取用户当前的地理位置信息（国家、省份、城市、经纬度及 ISP 信息）。适用于需要根据用户所在地提供本地化服务或天气信息的场景。",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
]
