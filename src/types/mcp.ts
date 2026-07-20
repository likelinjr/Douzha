interface LocalMcpServerConfig {
  command: string;
  args: string[];
}

interface RemoteMcpServerConfig {
  url: string;
  token: string;
}

type McpServerConfig = LocalMcpServerConfig | RemoteMcpServerConfig;

export interface McpConfig {
  mcpServers: Record<string, McpServerConfig>;
}