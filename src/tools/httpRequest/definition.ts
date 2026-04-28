import { ToolDefinition } from "../../types/tool.js"

export const httpToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "http_request",
      description: "发送通用的 HTTP 网络请求。适用于调用外部 API、与 Web 服务交互或获取结构化数据。",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "完整的请求 URL，例如 'https://api.github.com/user'。"
          },
          method: {
            type: "string",
            description: "HTTP 方法（GET, POST, PUT, DELETE, PATCH 等）。默认为 GET。",
            enum: ["GET", "POST", "PUT", "DELETE", "PATCH"]
          },
          headers: {
            type: "object",
            description: "JSON 格式的请求头对象，例如 {'Content-Type': 'application/json'}。"
          },
          body: {
            type: "string",
            description: "请求体内容（字符串形式）。如果是 JSON，请确保它是经过 stringify 处理的。"
          }
        },
        required: ["url"]
      }
    }
  }
]