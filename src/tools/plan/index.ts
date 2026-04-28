import * as planTools from './tools.js'

export const plan_toolHandlers: Record<string, (args: any) => Promise<string>> = {
  'sync_task_plan': (args) => planTools.syncTaskPlan(args.goal, args.plan),
}