import { ToolDefinition } from "../../types/tool.js"
import dedent from "dedent"

export const commandToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "execute_command",
      description: dedent`
      在安全的 Linux 终端环境中执行完整的系统命令、运行脚本或操作文件，支持所有标准的 Bash 语法，
      执行目录为 "/"， Doza 目录位于 "/Doza"，技能目录位于 "/Skills"，如果需要执行或访问到对应目录的文件，需要指明。
      例如：python /Doza/Workspace/hello.py，
      'pip install pdfplumber && python /Doza/Workspace/read_pdf.py' 或 'ls -la | grep pdf'
      [核心环境说明]
      1. 状态保持：这是一个有状态的常驻终端（Stateful Terminal）。通过 'cd' 切换的目录、'export' 设置的环境变量，在后续的调用中都会永久保留。你可以分步执行命令，不需要每次都用 '&&' 串联。
      2. 严禁交互：绝对禁止执行任何需要人工输入或持续挂起的命令（如 vim, top, htop, tail -f，以及需要输入 y/n 的提示）。安装依赖或删除文件时，必须使用 -y 或 -f 等参数进行静默/强制执行。一旦触发交互式阻塞，终端将卡死并导致任务失败。
      `,
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
            description: "完整终端命令字符串"
          }
        },
        required: ["command"]
      }
    }
  }
]