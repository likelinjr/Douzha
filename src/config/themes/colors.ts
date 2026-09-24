export const hexToAnsi = (hex: string): string => {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `\x1b[38;2;${r};${g};${b}m`
}

export const COLORS = {
  ASTRAL_BLUE: '#93b5cf',
  PINK: '#eeb8c3',
  GREEN: '#66c18c',
  ORANGE: '#f59e0b',
  SAGE: '#8fae8f',           // 鼠尾草绿
  LAVENDER: '#b4a7d6',       // 薰衣草紫
  ROSEWOOD: '#c4a882',       // 玫瑰木棕
  SLATE: '#8b9eb0',          // 石板蓝灰
  CORAL: '#d4a59a',          // 珊瑚粉
  TEAL: '#7eb5a6',           // 蓝绿
  AMBER: '#d4b896',          // 琥珀
  MAUVE: '#c9b1c9',          // 淡紫红
  STEEL: '#90a4ae',          // 钢青灰
  TERRACOTTA: '#c9957a',     // 赤陶
  DUSTY_ROSE: '#d4a5a5',     // 灰玫瑰
  SEAFOAM: '#96b5a8',        // 海泡绿
  SAND: '#d4c4a8',           // 沙色
  PLUM: '#b58da3',           // 李子紫
  APPLE_RED: '#f15642'       // 苹果红
}

export const DEV_REASONING_COLOR = hexToAnsi(COLORS.ASTRAL_BLUE)
export const DEV_TOOL_COLOR = hexToAnsi(COLORS.PINK)
export const DEV_COMMON_COLOR = hexToAnsi(COLORS.GREEN)
export const DEV_ASSISTANT_COLOR = hexToAnsi(COLORS.ORANGE)
export const DEV_USER_COLOR = hexToAnsi(COLORS.GREEN)
export const DEV_RESET = '\x1b[0m'
export const getDevColor = (color: keyof typeof COLORS) => hexToAnsi(COLORS[color])

export const TUI_THEMES = '#93b5cf'