import { ToolDefinition } from "../../types/tool.js"

export const commandToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "execute_command",
      description: "在指定的目录中执行终端命令。适用于运行脚本、安装依赖、编译代码或查看系统状态。",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "可执行文件或命令，例如 'python', 'ls', 'ssh'等。"
          },
          args: {
            type: "array",
            items: { type: "string" },
            description: "传递给命令的参数列表，例如 ['install', '--save'] 或 ['script.py']。"
          },
          cwd: {
            type: "string",
            description: "命令执行的目录，默认为当前目录。"
          }
        },
        required: ["file"]
      }
    }
  }
]