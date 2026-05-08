import { Role } from './index.js'

export type PlanStatus = 'todo' | 'doing' | 'done' | 'failed'
export type StepStatus = 'todo' | 'doing' | 'done' | 'failed'

export interface SessionRow {
    id: number;
    summary: string | null;
    plan_id: number | null;
    created_at: string;
}

export interface MessageRow {
    id: number;
    session_id: number;
    role: Role;       
    content: string | null
    tool_calls: string | null
    tool_call_id: string | null
    created_at?: string;
}

export interface TaskPlanRow {
    id: number;
    goal: string;
    status: PlanStatus;
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
export interface FullTaskPlan extends TaskPlanRow {
    steps: PlanStepRow[];
}