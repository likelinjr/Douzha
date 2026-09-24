import { Client, GatewayIntentBits, Events } from 'discord.js'
import { commonLog } from '../../utils/debug.js'

export function createClient(): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  })

  client.once(Events.ClientReady, (c) => {
    commonLog(`\n✅ Discord 已登录: ${c.user.tag}`)
  })

  return client
}
