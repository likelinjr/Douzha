import 'dotenv/config'
import { Client, GatewayIntentBits, Events, Message } from 'discord.js'
import { commonLog } from '../../utils/debug.js'
import { initProxy } from '../../utils/proxy.js'
import { TextBasedChannel } from 'discord.js'
initProxy()

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
})

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

commonLog("\nDiscord Bot 启动中...")

client.once(Events.ClientReady, (c) => {
  commonLog(`\n✅ 已登录: ${c.user.tag}`)
})

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.author.bot) return
  commonLog(`\n📩 收到消息: [${message.author.tag}] ${message.content}`)
  const stopTyping = startContinuousTyping(message.channel)
  await message.reply('Hello!')
  stopTyping()
})

client.login(process.env.DISCORD_BOT_TOKEN)