import { ToolDefinition } from "../../types/tool.js"

export const downloadToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "download_file",
      description: "从指定 URL 下载文件并保存到本地，下载完成后返回文件保存路径和大小信息。",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "要下载的文件完整 URL，例如'https://example.com/file.zip'。"
          },
          filename: {
            type: "string",
            description: "保存的文件名（含扩展名），例如 'photo.jpg'、'document.pdf'。如果不指定，则从 URL 中自动提取文件名。"
          }
        },
        required: ["url"]
      }
    }
  }
]
