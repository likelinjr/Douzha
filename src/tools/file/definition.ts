import { ToolDefinition } from "../../types/tool.js"

export const fileToolsDefinition :ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "读取目录中文件的内容。适用于需要分析或处理文件数据时。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "相对于 /sandbox 的文件路径"
          }
        },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "write_file",
      description: "向指定路径写入文件。支持自动创建不存在的父目录。如果文件已存在，则会覆盖其内容。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "目标文件路径（相对于根目录）。可以包含子文件夹路径，例如 'src/main.js' 或 'css/style.css'，缺失的文件夹将被自动创建。"
          },
          content: {
            type: "string",
            description: "要写入文件的完整内容。"
          }
        },
        required: ["path", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_files",
      description: "列出当前工作目录或指定目录下的所有文件。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "目录路径，默认为 '.' (根目录)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_file",
      description: "从工作目录中永久删除指定的单个文件。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "要删除的文件路径（相对于根目录，例如 'config.json' 或 'logs/old.txt'）"
          }
        },
        required: ["path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "copy_file",
      description: "将工作目录的文件从一个位置复制到另一个位置。",
      parameters: {
        type: "object",
        properties: {
          source: {
            type: "string",
            description: "源文件路径"
          },
          destination: {
            type: "string",
            description: "目标文件路径（需包含文件名）"
          }
        },
        required: ["source", "destination"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "edit_file",
      description: "对文本文件进行局部修改。适用于任何文本文件。通过提供一段文件中现有的、唯一的‘旧文字’，并给出‘新文字’来完成替换。",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "文件路径" },
          old_text: { type: "string", description: "文件中现有的文字内容。必须提供足够的上下文以确保在文中是唯一的。" },
          new_text: { type: "string", description: "准备替换进去的新文字。" }
        },
        required: ["path", "old_text", "new_text"]
      }
    }
  }
]