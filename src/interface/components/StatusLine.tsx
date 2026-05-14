import React, { useEffect, useState } from 'react'
import { Text } from 'ink'

type Status = 'idle' | 'thinking' | 'working'

type Props = {
  status: Status
}

export function StatusLine({ status }: Props) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (status === 'idle') return

    const timer = setInterval(() => {
      setFrame(f => f + 1)
    }, 70)
    return () => clearInterval(timer)
  }, [status])

  if (status === 'idle') return null

  const label = status === 'thinking' ? '   Thinking...' : '   Working...'
  const chars = [...label]
  const len = chars.length
  const pos = ((frame * 0.5) % (len + 6)) - 3

  return (
    <Text>
      {chars.map((ch, i) => {
        const dist = Math.abs(i - pos)
        if (dist <= 2) {
          return <Text key={i} bold color="cyan">{ch}</Text>
        }
        return <Text key={i} dimColor>{ch}</Text>
      })}
    </Text>
  )
}
