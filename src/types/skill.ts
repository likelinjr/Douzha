export interface SkillMeta {
  name: string
  description: string
  'when_to_use'?: string
  'arguments'?: string
  'argument-hint'?: string
}

export interface CommandMatch {
  fullMatch: string
  command: string
  startIndex: number
  endIndex: number
}
