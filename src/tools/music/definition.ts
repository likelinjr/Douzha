import { ToolDefinition } from "../../types/tool.js"

export const musicToolsDefinition: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "play_song",
      description: "播放单首本地音乐文件。",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "音乐文件路径。"
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
      description: "播放整个文件夹中的所有音频文件。",
      parameters: {
        type: "object",
        properties: {
          folder_path: {
            type: "string",
            description: "文件夹路径。"
          }
        },
        required: ["folder_path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "shuffle_play",
      description: "随机播放文件夹中的所有音频文件。",
      parameters: {
        type: "object",
        properties: {
          folder_path: {
            type: "string",
            description: "文件夹路径。"
          }
        },
        required: ["folder_path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "loop_song",
      description: "单曲循环播放一首音乐，无限循环直到手动停止。",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "音乐文件路径。"
          }
        },
        required: ["file_path"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "loop_folder",
      description: "列表循环播放文件夹中的所有音频文件，播放完一轮后从头开始，无限循环直到手动停止。",
      parameters: {
        type: "object",
        properties: {
          folder_path: {
            type: "string",
            description: "文件夹路径。"
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
      description: "停止当前正在播放的音乐。",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
]
