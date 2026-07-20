import { Directive, DirectiveContext } from '../types/directive.js'
import { getDirectoryTreeSelf } from '../tools/file/tools.js'

async function execute(context: DirectiveContext): Promise<void> {
  const args = context.args
  if (args.length === 0) {
    console.log(`  用法: /file [路径]`)
    console.log('  /file ./   显示当前目录树')
    console.log('  /file ./Workspace   显示 Workspace 目录树')
    return
  }
  const result = await getDirectoryTreeSelf(args[0])
  console.log(result)
}

export const file: Directive = {
  description: '显示目录树形结构',
  usage: '/file [路径]',
  execute
}