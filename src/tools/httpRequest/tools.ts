import TurndownService from 'turndown'
import { extractText } from 'unpdf'
import { ToolResult } from '../../types/tool.js'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  hr: '---'
})

// 过滤掉不需要的标签
turndownService.remove(['script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav'])
export async function httpRequest(
  url: string,
  method: string = "GET",
  headers: Record<string, string> = {},
  body?: object
): Promise<ToolResult> {
  try {
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        ...headers
      }
    }
    if (body && ["POST", "PUT", "PATCH"].includes(options.method!)) {
      options.body = JSON.stringify(body)
      if (!headers['Content-Type']) {
        options.headers = { ...options.headers, 'Content-Type': 'application/json' }
      }
    }
    const response = await fetch(url, options)
    const contentType = response.headers.get("content-type") || ""
    let resultText = ""
    if (contentType.includes("application/json")) {
      const json = await response.json()
      resultText = JSON.stringify(json, null, 2)
    }
    else if (contentType.includes("text/html")) {
      const html = await response.text()
      resultText = turndownService.turndown(html)
    }
    else if (contentType.includes("application/pdf")) {
      const arrayBuffer = await response.arrayBuffer()
      const { text } = await extractText(arrayBuffer)
      resultText = `[PDF文本内容]\n${text}`
    }
    else {
      resultText = await response.text()
    }
    const resultPrefix = `[${options.method}] ${url} -> 状态码: ${response.status} ${response.statusText}`
    const LIMIT = 10000
    if (resultText.length > LIMIT) {
      resultText = resultText.substring(0, LIMIT) + "\n...(内容过长，已截断)"
    }
    return {
      content: [{ type: "text", text: `${resultPrefix}\n响应内容: ${resultText}` }],
      isError: false
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      content: [{ type: "text", text: `网络请求失败: ${message}` }],
      isError: true
    }
  }
}