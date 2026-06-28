export type StepStatus = 'todo' | 'doing' | 'done' | 'failed'

export interface TaskPlanRow {
    id: number;
    goal: string;
    created_at?: string;
    updated_at?: string;
}

export interface PlanStepRow {
    id?: number;
    plan_id: number;
    step_order: number;
    step: string
    status: StepStatus
    result: string
}

export interface StepUpdate {
    step_order: number
    status: StepStatus
    result?: string
}

export interface FullTaskPlan extends TaskPlanRow {
    steps: PlanStepRow[];
}

export interface planStepType {
  step: string
  status: 'todo' | 'doing' | 'done' | 'failed'
  result: string
}