import { ToolDefinition } from "../../types/tool.js"

export const commandToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "execute_command",
      description: "在指定的目录中执行终端命令。适用于运行脚本、安装依赖、编译代码或查看系统状态。注意：命令运行有 30 秒的超时限制，请勿执行会永久阻塞终端的命令。重点：不能写与当前操作系统不兼容的命令！",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "要执行的可执行文件或命令，例如 'npm', 'python', 'ls', 'yt-dlp', 'ssh' 等。"
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