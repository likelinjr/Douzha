import { ToolDefinition } from "../../types/tool.js"

export const musicToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "play_song",
      description: "播放单首本地音乐文件",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "音乐文件绝对路径"
          },
          loop: {
            type: "boolean",
            description: "是否单曲循环"
          }
        },
        required: ["file_path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "play_folder",
      description: "播放文件夹中的所有音频文件",
      parameters: {
        type: "object",
        properties: {
          folder_path: {
            type: "string",
            description: "文件夹绝对路径"
          },
          shuffle: {
            type: "boolean",
            description: "是否随机播放"
          },
          loop: {
            type: "boolean",
            description: "是否列表循环"
          }
        },
        required: ["folder_path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "stop_music",
      description: "停止当前正在播放的音乐",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
]
