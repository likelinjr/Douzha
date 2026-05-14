import React, { useEffect, useState } from 'react'
import { Box, Text } from 'ink'
import { character } from '../../main/character.js'
import { poems } from '../../main/poems.js'
import { getCurrentTime, osInfo } from '../../utils/system.js'

type Props = {
  onDone: () => void
}

export function Banner({ onDone }: Props) {
  const [lines, setLines] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [poem] = useState(() => poems[Math.floor(Math.random() * poems.length)]!)
  const allLines = character.split('\n').filter(l => l)

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < allLines.length) {
        setLines(prev => [...prev, allLines[index]!])
        index++
      } else {
        clearInterval(timer)
        setDone(true)
        onDone()
      }
    }, 15)
    return () => clearInterval(timer)
  }, [])

  return (
    <Box flexDirection="column" marginBottom={1}>
      {lines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
      {done && (
        <>
          <Text>{`🕐 ${getCurrentTime()}`}</Text>
          <Text>{`💻 操作系统 ${osInfo}`}</Text>
          <Text>{`📜 ${poem}`}</Text>
          <Text>{"💡 输入'Q'退出"}</Text>
        </>
      )}
    </Box>
  )
}
