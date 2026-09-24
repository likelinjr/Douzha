process.env.DEBUG = 'true'

import { Events, Message } from 'discord.js'
import { commonLog } from '../../utils/debug.js'
import { initProxy } from '../../utils/proxy.js'
import { createClient } from './client.js'
import { handleMessage } from './handler.js'

initProxy()

const client = createClient()

commonLog('\nDiscord Bot 启动中...')

client.on(Events.MessageCreate, async (message: Message) => {
  await handleMessage(message)
})

client.login(process.env.DISCORD_BOT_TOKEN)
