
export const hexToAnsi = (hex: string) :string => {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return `\x1b[38;2;${r};${g};${b}m`
}

export const COLORS = {
  ASTRAL_BLUE: hexToAnsi('#93b5cf'),
  PINK: hexToAnsi('#eeb8c3'),
  GREEN: hexToAnsi('#66c18c'),
  ORANGE: hexToAnsi('#f59e0b'),
  SAGE: hexToAnsi('#8fae8f'),           // 鼠尾草绿
  LAVENDER: hexToAnsi('#b4a7d6'),       // 薰衣草紫
  ROSEWOOD: hexToAnsi('#c4a882'),       // 玫瑰木棕
  SLATE: hexToAnsi('#8b9eb0'),          // 石板蓝灰
  CORAL: hexToAnsi('#d4a59a'),          // 珊瑚粉
  TEAL: hexToAnsi('#7eb5a6'),           // 蓝绿
  AMBER: hexToAnsi('#d4b896'),          // 琥珀
  MAUVE: hexToAnsi('#c9b1c9'),          // 淡紫红
  STEEL: hexToAnsi('#90a4ae'),          // 钢青灰
  TERRACOTTA: hexToAnsi('#c9957a'),     // 赤陶
  DUSTY_ROSE: hexToAnsi('#d4a5a5'),     // 灰玫瑰
  SEAFOAM: hexToAnsi('#96b5a8'),        // 海泡绿
  SAND: hexToAnsi('#d4c4a8'),           // 沙色
  PLUM: hexToAnsi('#b58da3'),           // 李子紫
}

export const REASONING_COLOR = COLORS.ASTRAL_BLUE
export const TOOL_COLOR = COLORS.PINK
export const COMMON_COLOR = COLORS.GREEN
export const RESET = '\x1b[0m'

export const ASSISTANT_COLOR = COLORS.ORANGE
export const USER_COLOR = COLORS.GREEN
