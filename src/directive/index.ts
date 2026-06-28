import { Directive, DirectiveContext } from '../types/directive.js'
import { hello } from './hello.js'
import { weather } from './weather.js'
import { file } from './file.js'
import { music } from './music.js'

const directives: Record<string, Directive> = {
  hello,
  weather,
  file,
  music
}

export function isDirective(input: string): boolean {
  return input.trim().startsWith('/')
}

export async function executeDirective(rawInput: string): Promise<void> {
  const trimmed = rawInput.trim()
  const parts = trimmed.split(/\s+/)
  const name = parts[0].slice(1).toLowerCase()
  const args = parts.slice(1)
  const directive = directives[name]
  if (!directive) {
    console.log(`❌ 未知指令: ${trimmed}\n可用指令: ${Object.keys(directives).map(k => `/${k}`).join(', ')}`)
    return
  }
  const context: DirectiveContext = { rawInput: trimmed, args }
  await directive.execute(context)
}

export function listDirectives(): Record<string, Directive> {
  return directives
}
