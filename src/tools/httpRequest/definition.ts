import { ToolDefinition } from "../../types/tool.js"

export const httpToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "http_request",
      description: "发送通用的 HTTP 网络请求",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "完整的请求 URL，例如 https://api.github.com/user"
          },
          method: {
            type: "string",
            description: "HTTP 方法，可选: GET, POST, PUT, DELETE, PATCH，默认为 GET",
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"]
          },
          headers: {
            type: "object",
            description: "可选，用于 Authorization 等自定义请求头"
          },
          body: {
            type: "object",
            description: "请求体内容，JSON 对象形式"
          }
        },
        required: ["url"]
      }
    }
  }
]