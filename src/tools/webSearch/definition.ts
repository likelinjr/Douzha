import { ToolDefinition } from "../../types/tool.js"

export const webSearchToolsDefinition :ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "当你的本地知识无法回答问题，或者需要查询实时资讯（如天气、最新技术文档、新闻等）时使用此工具。",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索关键词或具体问题" }
        },
        required: ["query"]
      }
    }
  }
]