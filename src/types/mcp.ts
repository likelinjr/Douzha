interface LocalMcpServerConfig {
  type: "stdio"
  command: string
  args: string[]
  env?: Record<string, string>
}

interface RemoteMcpServerConfig {
  type: "http" | "streamablehttp"
  url: string
  headers?: Record<string, string>
  env?: Record<string, string>
}

type McpServerConfig = LocalMcpServerConfig | RemoteMcpServerConfig;

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>
}
