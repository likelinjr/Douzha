import { ToolDefinition } from "../../types/tool.js"

export const musicToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "play_online_music",
      description: "根据关键词在互联网上搜索并自动播放音乐",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "搜索关键词" }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "stop_music",
      description: "立即停止当前正在播放的所有音乐进程",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
]