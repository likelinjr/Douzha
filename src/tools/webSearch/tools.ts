import { initProxy } from "../../utils/proxy.js"
import { ToolResult } from '../../types/tool.js'

export async function webSearch(query: string): Promise<ToolResult> {
  initProxy()
  try {
    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
      return {
        content: [{ type: "text", text: "未配置 TAVILY_API_KEY" }],
        isError: true
      }
    }
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
      return {
        content: [{ type: "text", text: `搜索返回异常: ${data.error || data.detail || '未知错误'}` }],
        isError: true
      }
    }
    const results = (data.results || []).map((res: any) =>
      `标题: ${res.title}\n链接: ${res.url}\n内容: ${res.content}\n`
    ).join('\n---\n')
    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `搜索 "${query}" 完成，但未找到相关结果。` }],
        isError: false
      }
    }
    return {
      content: [{ type: "text", text: `搜索结果 (关键词: ${query}):\n\n${results}` }],
      isError: false
    }
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `网络搜索发生异常: ${error.message}` }],
      isError: true
    }
  }
}