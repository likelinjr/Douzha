import { ToolDefinition } from "../../types/tool.js"

export const imageToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "image_to_base64",
      description: "将图片文件转换为base64编码，支持png、jpg、jpeg、gif、webp、bmp、svg格式",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "图片文件的路径，如 /Doza/Workspace/photo.png"
          }
        },
        required: ["path"]
      }
    }
  }
]
