import { run } from '../core/engine.js'
import dotenv from 'dotenv'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { character } from './character.js'
import { poems } from './poems.js'
import { getCurrentTime, osInfo } from '../utils/system.js'

dotenv.config()

async function printStartupBanner() {
  const lines = character.split('\n')
  for (const line of lines) {
    console.log(line)
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  const poem = poems[Math.floor(Math.random() * poems.length)]
  console.log(`🕐 ${getCurrentTime()}`)
  console.log(`💻 操作系统 ${osInfo}`)
  console.log(`📜 ${poem}`)
}

await printStartupBanner()

async function bootstrap() {

  const rl = readline.createInterface({
    input,
    output,
    prompt: '>> ',
    terminal: false
  })
  console.log("💡 输入'Q'退出")
  console.log("")

  rl.prompt()

  rl.on('line', async (userInput) => {
    try {
      if (userInput.toLowerCase().trim() === 'q') {
        rl.close()
        process.exit(0)
      }
      if (!userInput.trim()) {
        rl.prompt()
        return
      }
      await run(userInput)
      rl.prompt()
    } catch (err: any) {
      console.error("\n💥 运行过程中发生崩溃:", err.message || err)
      console.log("🔄 尝试重启循环...\n")
      rl.prompt()
    }
  })

}

bootstrap()