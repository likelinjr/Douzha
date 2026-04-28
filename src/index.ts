import { run } from './core/engine.js'
import dotenv from 'dotenv'
import readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

dotenv.config()

async function bootstrap() {

  const rl = readline.createInterface({ input, output })

  console.log("-----------------------------------------")
  console.log("💡 输入 'exit' 或 'quit' 可以退出程序。")
  console.log("-----------------------------------------\n")

  while (true) {
    try {
      const userInput = await rl.question("> ")

      if (['exit', 'quit', '退出'].includes(userInput.toLowerCase().trim())) {
        break
      }

      if (!userInput.trim()) continue
      await run(userInput)
    } catch (err: any) {
      console.error("\n💥 运行过程中发生崩溃:", err.message || err)
      console.log("🔄 尝试重启循环...\n")
    }
  }

  rl.close()
}

bootstrap()