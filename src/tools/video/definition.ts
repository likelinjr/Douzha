import { ToolDefinition } from "../../types/tool.js"

export const videoToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "play_online_video",
      description: "根据关键词搜索并全屏播放视频，如华晨宇演唱会，窗口会自动置顶。",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "视频搜索关键词" }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "stop_video",
      description: "立即停止并关闭当前正在播放的所有视频窗口。",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
]