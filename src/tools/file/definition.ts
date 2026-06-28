import { ToolDefinition } from "../../types/tool.js"

export const fileToolsDefinition :ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "读取 workingDirectory 目录中文件的内容。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "相对于 workingDirectory 的文件路径"
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
      description: "在 DeskTop 子目录中向指定路径写入文件。支持自动创建不存在的父目录。如果文件已存在，则会覆盖其内容。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "目标文件路径。可以包含子文件夹路径"
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
      description: "列出 workingDirectory 或指定目录下的所有文件。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "目录路径，默认为'.'"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_file",
      description: "从 DeskTop 子目录中永久删除指定的单个文件。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "要删除的文件路径"
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
      description: "将文件从一个位置复制到另一个位置。目标位置必须在 DeskTop 目录中。可以从 workingDirectory 的任何位置读取源文件，但只能复制到 DeskTop 目录",
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
      description: "对 DeskTop 目录中的文本文件进行局部修改。适用于任何文本文件。通过提供一段文件中现有的、唯一的'旧文字'，并给出'新文字'来完成替换。",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "文件路径" },
          old_text: { type: "string", description: "文件中现有的文字内容。必须提供足够的上下文以确保在文中是唯一的。" },
          new_text: { type: "string", description: "替换进去的新文字。" }
        },
        required: ["path", "old_text", "new_text"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_directory_tree",
      description: "获取 workingDirectory 或指定目录的完整文件结构树，以树形图展示所有文件和子目录的层级关系。",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "要查看的目录路径，默认为当前工作目录 '.'"
          }
        }
      }
    }
  }
]