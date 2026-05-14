
export const hexToAnsi = (hex: string) :string => {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `\x1b[38;2;${r};${g};${b}m`
}

export const REASONING_COLOR = hexToAnsi('#93b5cf')
export const TOOL_COLOR = hexToAnsi('#eeb8c3')
export const COMMON_COLOR = hexToAnsi('#66c18c')
export const RESET = '\x1b[0m'

export const ASSISTANT_COLOR = hexToAnsi('#f59e0b')
export const USER_COLOR = hexToAnsi('#66c18c')
