import { useEffect, useState } from 'react'
import { TextAttributes } from '@opentui/core'
import { TUI_THEMES } from '../../config/themes/colors.js'

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
    <box marginTop={1} marginX={2} flexDirection="row">
      <text>
        {chars.map((ch, i) => {
          const dist = Math.abs(i - pos)
          if (dist <= 2) {
            return <span key={i} fg={TUI_THEMES} attributes={TextAttributes.BOLD}>{ch}</span>
          }
          return <span key={i} attributes={TextAttributes.DIM}>{ch}</span>
        })}
      </text>
    </box>
  )
}
