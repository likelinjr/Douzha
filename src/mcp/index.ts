import path from "path"
import * as fs from "fs/promises"
import { fileURLToPath } from "url"
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import { ToolDefinition, ToolHandler } from "../types/tool.js"
import { Tool } from "@modelcontextprotocol/sdk/types.js"
import { toolHandlers, allToolsDefinition } from "../tools/index.js"
import { McpConfig } from "../types/mcp.js"
import { commonLog } from "../utils/debug.js"
import { sanitizePaths } from "../utils/security.js"
import { ToolContentItem } from "../types/tool.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultConfigPath = path.join(__dirname, "mcp.config.json")

export async function connectLocalMcpServer(command: string, args: string[]) {
  const transport = new StdioClientTransport({ command, args })
  const client = new Client(
    { name: "Doza", version: "1.0.0" },
    { capabilities: {} }
  )
  await client.connect(transport)
  const { tools } = await client.listTools()
  return { client, tools }
}

export async function connectRemoteMcpServer(url: string, token: string) {
  const transport = new StreamableHTTPClientTransport(
    new URL(url),
    {
      requestInit: {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      }
    }
  )
  const client = new Client(
    { name: "Doza", version: "1.0.0" },
    { capabilities: {} }
  )
  await client.connect(transport)
  const { tools } = await client.listTools()
  return { client, tools } 
}

export async function createMcpHandler(client: Client, toolName: string): Promise<ToolHandler> {
  return async (args: any) => {
    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      })
      // MCP SDK 返回 string 或 { content: [...], isError?: boolean, _meta?: ... }
      if (typeof result === 'string') {
        return {
          content: [{ type: "text", text: result }],
          isError: false
        }
      }
      // result 是对象，提取 content 和 isError
      const { content, isError } = result as { content: ToolContentItem[], isError?: boolean }
      return {
        content: content,
        isError: isError ?? false
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      return {
        content: [{ type: "text", text: sanitizePaths(`❌ MCP 工具调用失败: ${message}`) }],
        isError: true
      }
    }
  }
}

function transformMcpTools(mcpTools: Tool[]): ToolDefinition[] {
  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: {
        type: "object",
        properties: (tool.inputSchema as any)?.properties || {},
        required: (tool.inputSchema as any)?.required || [],
      },
    },
  }))
}

export async function initializeMCP(configPath: string = defaultConfigPath ) {
  commonLog("\n正在初始化 MCP 服务...")
  try {
    const fileContent = await fs.readFile(configPath, "utf-8")
    const config: McpConfig = JSON.parse(fileContent)
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
      try {
        if ("command" in serverConfig) {
          commonLog(`\n⏳ 正在加载本地 MCP 服务: [${serverName}]...`)
          const local = await connectLocalMcpServer(serverConfig.command, serverConfig.args)
          allToolsDefinition.push(...transformMcpTools(local.tools))
          for (const tool of local.tools) {
            toolHandlers[tool.name] = await createMcpHandler(local.client, tool.name)
          }
          commonLog(`\n✅ 本地服务 [${serverName}] 工具加入完成，加载数量: ${local.tools.length}`)
        }
        else if ("url" in serverConfig) {
          commonLog(`\n⏳ 正在加载远程 MCP 服务: [${serverName}]...`)
          const remote = await connectRemoteMcpServer(serverConfig.url, serverConfig.token)
          allToolsDefinition.push(...transformMcpTools(remote.tools))
          for (const tool of remote.tools) {
            toolHandlers[tool.name] = await createMcpHandler(remote.client, tool.name)
          }
          commonLog(`\n✅ 远程服务 [${serverName}] 工具注入完成，加载数量: ${remote.tools.length}`)
        }
      } catch (serverError) {
        commonLog(`\n⚠️ MCP 服务 [${serverName}] 加载失败，已跳过该服务:`, serverError)
      }
    }
    commonLog("\n所有可用的 MCP 工具准备完毕")
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    commonLog(`\n❌ MCP 配置文件读取或解析失败 ${message}`)
  }
}