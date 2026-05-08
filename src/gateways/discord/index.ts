import 'dotenv/config'
import { Client, GatewayIntentBits, Events, Message } from 'discord.js'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { run } from '../../core/engine.js'
import { commonLog } from '../../utils/debug.js'

const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || 'http://192.168.1.107:7897'
setGlobalDispatcher(new ProxyAgent(PROXY_URL))

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

commonLog("Discord Gateway Started")

client.once(Events.ClientReady, (c) => {
  commonLog(`✅ 成功登录！当前账号：${c.user.tag}`)
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