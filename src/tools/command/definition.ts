import { ToolDefinition } from "../../types/tool.js"

export const commandToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "execute_command",
      description: "在指定的沙盒目录中执行终端命令。适用于运行脚本、安装依赖、编译代码或查看系统状态。注意：命令运行有 30 秒的超时限制，请勿执行会永久阻塞终端的命令（如启动 web 服务）。",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "要执行的完整的终端命令，例如 'npm install', 'python script.py', 或 'ls -la'。"
          },
          cwd: {
            type: "string",
            description: "命令执行的工作目录（相对于沙盒根目录）。默认为 '.'。"
          }
        },
        required: ["command"]
      }
    }
  }
]