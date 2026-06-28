export interface DirectiveContext {
  rawInput: string
  args: string[]
}

export interface Directive {
  description: string
  usage: string
  execute: (context: DirectiveContext) => Promise<void>
}