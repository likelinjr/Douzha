import TurndownService from 'turndown'
import { extractText } from 'unpdf'

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
  body?: string
): Promise<string> {
  try {
    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'MiniClaw-Agent/1.0',
        ...headers
      }
    }

    if (body && ["POST", "PUT", "PATCH"].includes(options.method!)) {
      options.body = body
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
      resultText = `[PDF 文本内容]\n${text}`
    } 
    else {
      resultText = await response.text()
    }

    const resultPrefix = `🌐 [${options.method}] ${url} -> 状态码: ${response.status} ${response.statusText}\n`
    const LIMIT = 10000
    if (resultText.length > LIMIT) {
      resultText = resultText.substring(0, LIMIT) + "\n...(内容过长，已截断)"
    }

    const formatNote = contentType.includes("pdf") ? "已提取纯文本" : "已转为Markdown格式"
    return `${resultPrefix}\n响应内容(${formatNote}):\n${resultText}`

  } catch (error: any) {
    return `❌ 网络请求失败: ${error.message}`
  }
}