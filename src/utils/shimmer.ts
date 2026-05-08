const DIM = '\x1b[2m'
const BRIGHT = '\x1b[1m'
const CYAN = '\x1b[36m'
const RESET = '\x1b[0m'

export function startShimmerText(text: string): () => void {
  const chars = [...text]
  const len = chars.length
  let pos = len + 3
  let running = true
  const timer = setInterval(() => {
    if (!running) return
    let rendered = ''
    for (let i = 0; i < len; i++) {
      const dist = Math.abs(i - pos)
      if (dist <= 2) {
        rendered += BRIGHT + CYAN + chars[i] + RESET
      } else {
        rendered += DIM + chars[i] + RESET
      }
    }
    process.stdout.write(`\r${rendered}`)
    pos -= 0.5
    if (pos < -3) pos = len + 3
  }, 70)
  return () => {
    running = false
    clearInterval(timer)
    process.stdout.write('\r' + ' '.repeat(len * 6) + '\r')
  }
}
