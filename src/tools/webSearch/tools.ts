import dotenv from "dotenv"
import { initProxy } from "../../utils/proxy.js"
dotenv.config()

export async function webSearch(query: string): Promise<string> {
  initProxy()  
  try {
    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) return "❌ 未配置 TAVILY_API_KEY"
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: "basic",
        max_results: 5
      })
    })
    const data = await response.json()
    if (!response.ok || data.error || !data.results) {
      return `❌ 搜索返回异常: ${data.error || data.detail || '未知错误'}`
    }
    const results = (data.results || []).map((res: any) => 
      `标题: ${res.title}\n链接: ${res.url}\n内容: ${res.content}\n`
    ).join('\n---\n')
    if (results.length === 0) return `🔍 搜索 "${query}" 完成，但未找到相关结果。`
    return `🔍 搜索结果 (关键词: ${query}):\n\n${results}`
  } catch (error: any) {
    return `❌ 网络搜索发生异常: ${error.message}`
  }
}