import * as planTools from './tools.js'

export const plan_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'update_task_plan': (args) => planTools.updateTaskPlan(args.plan_id, args.updates),
}