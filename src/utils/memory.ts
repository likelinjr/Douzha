import fs from 'fs/promises'
import path from 'path'
import { Message } from '../types/index.js'

const MEMORY_PATH = path.resolve(process.cwd(), 'data/history.json')

async function ensureDir() {
  const dir = path.dirname(MEMORY_PATH)
  try {
    await fs.access(dir)
  } catch {
    await fs.mkdir(dir, { recursive: true })
  }
}

export async function saveMemory(messages: Message[]) {
  await ensureDir()
  const data = JSON.stringify(messages, null, 2)
  await fs.writeFile(MEMORY_PATH, data, 'utf-8')
}

export async function loadMemory(): Promise<Message[]> {
  try {
    await ensureDir()
    const data = await fs.readFile(MEMORY_PATH, 'utf-8')
    return JSON.parse(data) as Message[]
  } catch {
    return []
  }
}

export async function clearMemory() {
  try {
    await fs.unlink(MEMORY_PATH)
  } catch {}
}