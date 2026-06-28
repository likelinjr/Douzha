import { ToolDefinition } from "../../types/tool.js"

export const weatherToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "get_24hours_weather",
      description: "获取指定城市未来24小时逐小时天气预报，包括温度、天气现象、风力、湿度及降水概率等。支持中国及全球主要城市名称。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '惠州' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_72hours_weather",
      description: "获取指定城市未来72小时逐小时天气预报，包括温度、天气现象、风力、湿度及降水概率等。适用于需要更长时间范围天气预报的场景。支持中国及全球主要城市名称。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '惠州' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_3days_weather",
      description: "获取指定城市未来3天每日天气预报，包括温度范围、天气现象、风力、湿度、降水量及紫外线指数等。支持中国及全球主要城市名称。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '惠州' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_7days_weather",
      description: "获取指定城市未来7天每日天气预报，包括温度范围、天气现象、风力、湿度、降水量及紫外线指数等。适用于需要更长时间范围天气预报的场景。支持中国及全球主要城市名称。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '惠州' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_air_quality",
      description: "获取指定城市未来24小时空气质量预报，包括AQI指数、空气质量等级、主要污染物、PM2.5、PM10、臭氧等数据。适用于需要了解空气质量变化趋势的场景。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '惠州' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_weather_warning",
      description: "获取指定城市当前生效的天气预警信息，包括预警等级、类型、发布时间和详细内容。适用于需要了解极端天气预警的场景。",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "需要查询的城市名称，例如 '惠州' 或 'New York'。"
          }
        },
        required: ["city"]
      }
    }
  }
]