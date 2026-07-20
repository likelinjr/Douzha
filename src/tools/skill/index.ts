import { ToolHandlers } from '../../types/tool.js'
import * as skillTools from './tools.js'

export const skillToolHandler: ToolHandlers = {
  'skill': args => skillTools.executeSkill(args.skill, args.args)
}