import dotenv from 'dotenv'
import { ModelConfig } from '../../types/modelConfig.js'
dotenv.config()

const Mimo = {
  baseURL: "https://token-plan-cn.xiaomimimo.com/v1",
  apiKey: process.env.MIMO_API_KEY || "",
  serviceProvider: "Mimo"
}
const DeepSeek = {
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  serviceProvider: "DeepSeek"
}
const BigModel = {
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  apiKey: process.env.ZHIPU_API_KEY || "",
  serviceProvider: "BigModel"
}
const Gemini = {
  baseURL: "",
  apiKey: process.env.GOOGLE_API_KEY || "",
  serviceProvider: "Gemini"
}

// gemini-3.1-flash-lite
// gemma-4-31b-it
export const DECISION_MAKER: ModelConfig = {
  ...Gemini,
  modelName: "gemma-4-31b-it"
}
export const ADVANCED_MODEL: ModelConfig = {
  ...Gemini,
  modelName: "gemma-4-31b-it"
}
export const BASE_MODEL: ModelConfig = {
  ...Gemini,
  modelName: "gemma-4-31b-it"
}

