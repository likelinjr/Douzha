import 'dotenv/config'
import { Client, GatewayIntentBits, Events, Message } from 'discord.js'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { run } from '../../core/engine.js'
import { commonLog } from '../../utils/debug.js'
import '../../main/initiate.js'

const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://192.168.1.107:7897'
setGlobalDispatcher(new ProxyAgent(PROXY_URL))

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
})

commonLog("Discord Gateway Started")

client.once(Events.ClientReady, (c) => {
  commonLog(`✅ 成功登录！当前账号：${c.user.tag}`)
})

// 监听 Gateway 错误和断开
client.on(Events.Error, (error) => {
  commonLog(`❌ Discord Gateway 错误: ${error.message}`)
})

client.on('shardDisconnect', () => {
  commonLog('⚠️ Discord Gateway 断开连接')
})

// 存储每条私信的 bot 回复消息引用（用于删除）
const dmReplyMap = new Map<string, string>() // messageId -> botReplyMessageId

// DM fallback：监听原始 WebSocket 事件处理私信
client.on('raw', async (packet: any) => {
  if (packet.t === 'MESSAGE_CREATE') {
    const isDM = !packet.d.guild_id

    // Fallback：如果 MessageCreate 没触发 DM 消息，在这里手动处理
    if (isDM && packet.d.author && !packet.d.author.bot) {
      const messageKey = `${packet.d.channel_id}-${packet.d.id}`
      if (processedMessages.has(messageKey)) return

      processedMessages.add(messageKey)
      setTimeout(() => processedMessages.delete(messageKey), MESSAGE_COOLDOWN)

      const content = packet.d.content
      commonLog(`📩 [DM Fallback] 收到私信: [${packet.d.author.username}] ${content}`)

      // 清除命令：删除所有消息
      if (content === 'clear') {
        try {
          const channel = await client.channels.fetch(packet.d.channel_id)
          if (channel && 'messages' in channel) {
            let deletedCount = 0
            while (true) {
              const messages = await (channel as any).messages.fetch({ limit: 100 })
              if (messages.size === 0) break
              for (const [, msg] of messages) {
                await msg.delete().catch(() => {})
                deletedCount++
              }
            }
            await (channel as any).send(`🗑️ 已清除所有消息，共 ${deletedCount} 条`)
          }
        } catch (error: any) {
          console.error('❌ 清除失败:', error.message)
        }
        return
      }

      try {
        const channel = await client.channels.fetch(packet.d.channel_id)
        if (channel && 'send' in channel) {
          if ('sendTyping' in channel) {
            await (channel as any).sendTyping()
          }
          const reply = await run(content)
          commonLog(`✅ AI 回复长度: ${reply?.length || 0}`)
          if (reply) {
            const botMsg = await (channel as any).send(reply.slice(0, 2000))
            dmReplyMap.set(packet.d.id, botMsg.id)
          }
        }
      } catch (error: any) {
        console.error('❌ DM 处理失败:', error.message)
      }
    }
  }
})

// 当 Bot 加入服务器时，主动给服务器成员发私信（打开 DM 频道）
client.on(Events.GuildCreate, async (guild) => {
  commonLog(`🏠 Bot 加入服务器: ${guild.name} (${guild.id})`)
})

const processedMessages = new Set<string>()
const MESSAGE_COOLDOWN = 5000 // 5秒内不处理相同消息

client.on(Events.MessageCreate, async (message: Message) => {
  const messageKey = `${message.channelId}-${message.id}`

  if (processedMessages.has(messageKey)) {
    return
  }

  processedMessages.add(messageKey)
  setTimeout(() => processedMessages.delete(messageKey), MESSAGE_COOLDOWN)

  commonLog(`📩 收到消息: [${message.author.tag}] ${message.content}`)

  if (message.author.bot) return

  if (message.content === 'ping') {
    await message.reply('🏓 Pong!')
    return
  }

  try {
    commonLog('⏳ 开始调用 AI...')
    if ('sendTyping' in message.channel) {
      await message.channel.sendTyping()
    }
    const reply = await run(message.content)
    commonLog(`✅ AI 回复长度: ${reply?.length || 0}`)
    if (reply) {
      await message.reply(reply.slice(0, 2000))
    } else {
      commonLog('⚠️ AI 返回空回复')
    }
  } catch (error: any) {
    console.error('❌ AI 处理失败:', error.message)
    console.error(error.stack)
    await message.reply(`❌ 处理出错: ${error.message}`)
  }
})

client.login(process.env.DISCORD_BOT_TOKEN)