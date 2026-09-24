import { useEffect, useState } from 'react'
import { character } from '../../main/character.js'
import { poems } from '../../main/poems.js'
import { getCurrentTime, osInfo } from '../../utils/system.js'

type Props = {
  onDone: () => void
}

export function Banner({ onDone }: Props) {
  const [lineCount, setLineCount] = useState(0)
  const [done, setDone] = useState(false)
  const [poem] = useState(() => poems[Math.floor(Math.random() * poems.length)]!)
  const allLines = character.split('\n').filter(l => l)

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < allLines.length) {
        index++
        setLineCount(index)
      } else {
        clearInterval(timer)
        setDone(true)
        onDone()
      }
    }, 15)
    return () => clearInterval(timer)
  }, [])

  const visibleLines = allLines.slice(0, lineCount)
  const bannerText = visibleLines.join('\n')
  const infoText = done
    ? `\n🕐 ${getCurrentTime()}\n💻 操作系统 ${osInfo}\n📜 ${poem}\n💡 输入'Q'退出`
    : ''

  return (
    <box flexDirection="column">
      <text>{bannerText}</text>
      {done && <text>{infoText}</text>}
    </box>
  )
}
