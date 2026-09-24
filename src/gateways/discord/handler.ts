import { Message, TextBasedChannel } from 'discord.js'
import { run } from '../../core/engine.js'
import { commonLog, errorLog } from '../../utils/debug.js'
import {
  formatToolCall,
  formatThinking,
  formatContent,
  formatError,
  formatWarning,
} from './formatter.js'

export function startContinuousTyping(channel: TextBasedChannel): () => void {
  if (!('sendTyping' in channel)) {
    return () => {}
  }
  channel.sendTyping().catch(console.error)
  const interval = setInterval(() => {
    channel.sendTyping().catch(console.error)
  }, 8000)
  return () => clearInterval(interval)
}

export async function handleMessage(message: Message): Promise<void> {
  if (message.author.bot) return

  const userContent = message.content
  commonLog(`\n📩 [${message.author.tag}] ${userContent}`)

  const stopTyping = startContinuousTyping(message.channel)

  let thinkingChunks = ''
  let contentChunks = ''

  try {
    for await (const event of run(userContent)) {
      switch (event.type) {
        case 'thinking':
          thinkingChunks += event.chunk
          break

        case 'content':
          contentChunks += event.chunk
          break

        case 'tool_calls':
          for (const tc of event.calls) {
            const embed = formatToolCall(tc)
            await message.channel.send({ embeds: [embed] }).catch(() => {})
          }
          break

        case 'error': {
          const embed = formatError(event.message)
          await message.channel.send({ embeds: [embed] }).catch(() => {})
          stopTyping()
          return
        }

        case 'warn': {
          const embed = formatWarning(event.message)
          await message.channel.send({ embeds: [embed] }).catch(() => {})
          stopTyping()
          return
        }

        case 'done':
          break
      }
    }

    stopTyping()

    if (thinkingChunks && !contentChunks) {
      const text = formatThinking(thinkingChunks)
      if (text.length > 2000) {
        await message.channel.send({ content: text.slice(0, 2000) }).catch(() => {})
      } else {
        await message.channel.send({ content: text }).catch(() => {})
      }
    }

    if (contentChunks) {
      const text = formatContent(contentChunks)
      if (text.length > 2000) {
        const chunks = splitMessage(text, 2000)
        for (const chunk of chunks) {
          await message.channel.send({ content: chunk }).catch(() => {})
        }
      } else {
        await message.channel.send({ content: text }).catch(() => {})
      }
    }
  } catch (e: any) {
    stopTyping()
    errorLog(`\n❌ Discord handler error: ${e.message}`)
    const embed = formatError(e.message || '未知错误')
    await message.channel.send({ embeds: [embed] }).catch(() => {})
  }
}

function splitMessage(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text]

  const chunks: string[] = []
  let remaining = text

  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf('\n', maxLen)
    if (splitAt <= 0) splitAt = maxLen
    chunks.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt).trimStart()
  }

  if (remaining) chunks.push(remaining)
  return chunks
}
