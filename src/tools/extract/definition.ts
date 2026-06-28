import { ToolDefinition } from "../../types/tool.js"

export const extractToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "extract_file",
      description: "解压压缩文件到指定目录。支持 .zip、.tar、.tar.gz / .tgz、.gz 格式。解压完成后返回解压出的文件列表和目录信息。",
      parameters: {
        type: "object",
        properties: {
          filepath: {
            type: "string",
            description: "要解压的压缩文件完整路径，例如 './Downloads/archive.zip' "
          },
          outputDir: {
            type: "string",
            description: "解压输出目录路径。如果不指定，则在压缩文件同目录下创建同名文件夹作为输出目录。"
          }
        },
        required: ["filepath"]
      }
    }
  }
]
