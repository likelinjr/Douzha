import { SYSTEM_MESSAGE_TAG,
  BASH_MESSAGE_TAG,
  HISTORY_MESSAGE_TAG,
  TOOL_MESSAGE_TAG,
  SKILL_TAG,
  USER_MESSAGE_TAG,
  ASSISTANT_MESSAGE_TAG } from './labels.js'
import dedent from 'dedent'

// 用 XML 标签包装内容
export function wrapTag(tag: string, content: string): string {
  return `<${tag}>${content.trim()}</${tag}>`
}

export function wrapSystem(content: string): string {
  return wrapTag(SYSTEM_MESSAGE_TAG, content)
}

export function wrapBash(content: string): string {
  return wrapTag(BASH_MESSAGE_TAG, content)
}

export function wrapHistory(content: string): string {
  return wrapTag(HISTORY_MESSAGE_TAG, content)
}

export function wrapTool(content: string): string {
  return wrapTag(TOOL_MESSAGE_TAG, content)
}

export function wrapSkill(content: string): string {
  return wrapTag(SKILL_TAG, content)
}

export function wrapUser(content: string): string {
  return wrapTag(USER_MESSAGE_TAG, content)
}

export function wrapAssistant(content: string): string {
  return wrapTag(ASSISTANT_MESSAGE_TAG, content)
}

export const wrapByRole: Record<string, (c: string) => string> = {
  user: wrapUser,
  assistant: wrapAssistant,
  tool: wrapTool,
}

export function labelExplanation():string {
  return (dedent`
  # 标签解释
  你可以根据不同的的标签区分不同来源的消息内容：
  - system-reminder：标签内容为系统提醒
  - user-message：标签内容为用户消息
  - assistant-message：标签内容为 AI 消息
  - skill-content：标签内容为 skill 内容
  - tool-result：标签内容为工具调用结果
  - history-message：标签内容为历史对话消息
  **注意！标签只是用来区分不同内容，请不要当作你的输出格式**
  `).trim()
}