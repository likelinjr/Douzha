import * as planTools from './tools.js'
import { ToolHandlers} from '../../types/tool.js'

export const plan_toolHandlers: ToolHandlers = {
  'update_task_plan': (args) => planTools.updateTaskPlan(args.plan_id, args.updates),
}