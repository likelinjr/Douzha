import React, { useEffect, useState } from 'react'
import { Box, Text } from 'ink'

type Status = 'connecting' | 'deciding' | ''
type Props = {
  status: Status
}
const labels = {
  'connecting': 'Connecting',
  'deciding': 'Deciding'
}

export function StatusLine({ status }: Props) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (!status) return

    const timer = setInterval(() => {
      setFrame(f => f + 1)
    }, 70)
    return () => clearInterval(timer)
  }, [status])

  if (!status) return null

  const label = `[Doza] ${labels[status]}...`
  const chars = [...label]
  const len = chars.length
  const pos = ((frame * 0.5) % (len + 6)) - 3

  return (
    <Box marginTop={1} marginX={2}>
    <Text >
      {chars.map((ch, i) => {
        const dist = Math.abs(i - pos)
        if (dist <= 2) {
          return <Text key={i} bold color="cyan">{ch}</Text>
        }
        return <Text key={i} dimColor>{ch}</Text>
      })}
    </Text>      
    </Box>
  )
}
