import { Directive, DirectiveContext } from '../types/directive.js'
import { listDirectives } from './index.js'

async function execute(context: DirectiveContext): Promise<void> {
  console.log(`  🌸 Hello! ${context.args.join(' ')}`)
  const all = listDirectives()
  for (const [name, dir] of Object.entries(all)) {
    if (name === 'hello') continue
    console.log(`  /${name.padEnd(10)} ${dir.description}`)
  }
}

export const hello: Directive = {
  description: '打个招呼',
  usage: '/hello',
  execute
}
