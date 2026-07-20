import dotenv from 'dotenv'
import { ModelConfig } from '../../types/modelConfig.js'
dotenv.config()

// const Mimo = {
//   baseURL: "https://api.xiaomimimo.com/v1",
//   apiKey: process.env.MIMO_API_KEY || "",
//   serviceProvider: "Mimo"
// }
// const Doubao = {
//   baseURL: "https://ark.cn-beijing.volces.com/api/v3",
//   apiKey: process.env.DOUBAO_API_KEY || "",
//   serviceProvider: "Doubao"
// }
// const DeepSeek = {
//   baseURL: "https://api.deepseek.com",
//   apiKey: process.env.DEEPSEEK_API_KEY || "",
//   serviceProvider: "DeepSeek"
// }
// const BigModel = {
//   baseURL: "https://open.bigmodel.cn/api/paas/v4/",
//   apiKey: process.env.ZHIPU_API_KEY || "",
//   serviceProvider: "BigModel"
// }
// const Google = {
//   baseURL: "",
//   apiKey: process.env.GOOGLE_API_KEY || "",
//   serviceProvider: "Google"
// }
// const Kimi = {
//   baseURL: "https://api.moonshot.cn/v1",
//   apiKey: process.env.KIMI_API_KEY || "",
//   serviceProvider: "Kimi"
// }
// const MiniMax = {
//   baseURL: "https://api.minimaxi.com/v1",
//   apiKey: process.env.MINIMAX_API_KEY || "",
//   serviceProvider: "MiniMax"
// }
// const Qwen = {
//   baseURL: "https://ws-xs26fw8k6tnnlrpb.cn-beijing.maas.aliyuncs.com/compatible-mode/v1",
//   apiKey: process.env.QWEN_API_KEY || "",
//   serviceProvider: "Qwen"
// }
// const OpenAI = {
//   baseURL: "",
//   apiKey: process.env.OPENAI_API_KEY || "",
//   serviceProvider: "OpenAI"
// }
// const Anthropic = {
//   baseURL: "https://api.longcat.chat/anthropic",
//   apiKey: process.env.LONGCAT_API_KEY || "",
//   serviceProvider: "Anthropic"
// }
// const Anthropic = {
//   baseURL: "https://open.bigmodel.cn/api/anthropic",
//   apiKey: process.env.ZHIPU_API_KEY || "",
//   serviceProvider: "Anthropic"
// }
const LongCat = {
  baseURL: "https://api.longcat.chat/openai",
  apiKey: process.env.LONGCAT_API_KEY || "",
  serviceProvider: "LongCat"
}
// const LocalModel = {
//   baseURL: "http://192.168.52.139:1234/v1",
//   apiKey: "sk-lm-J76FZUc6:9hRfWUpQcQG4912KTO0H",
//   serviceProvider: "Local"
// }
// 

// gemini-3.1-flash-lite 非思考
// gemma-4-26b-a4b-it
// gemma-4-31b-it
// MiniMax-M3
// qwen3.7-plus
// GPT-5.4 mini
// mimo-v2.5-pro
// LongCat-2.0

export const DECISION_MAKER: ModelConfig = {
  ...LongCat,
  protocol: "OpenAI",
  modelName: "LongCat-2.0"
}
export const ADVANCED_MODEL: ModelConfig = {
  ...LongCat,
  protocol: "OpenAI",  
  modelName: "LongCat-2.0"
}
export const BASE_MODEL: ModelConfig = {
  ...LongCat,
  protocol: "OpenAI",
  modelName: "LongCat-2.0"
}

export const IS_DECIDE = false

// export const DECISION_MAKER: ModelConfig = {
//   baseURL: "http://localhost:8081/v1",
//   apiKey: "",
//   protocol: "OpenAI",
//   modelName: ""
// }
// export const ADVANCED_MODEL: ModelConfig = {
//   baseURL: "http://localhost:8081/v1",
//   apiKey: "",
//   protocol: "OpenAI",  
//   modelName: ""
// }
// export const BASE_MODEL: ModelConfig = {
//   baseURL: "http://localhost:8081/v1",
//   apiKey: "",
//   protocol: "OpenAI",
//   modelName: ""
// }