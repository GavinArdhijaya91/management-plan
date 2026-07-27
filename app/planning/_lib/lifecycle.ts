import type {
  ActionItemStatus,
  BusinessGoalStatus,
  BusinessInitiativeStatus,
  BusinessPlanStatus,
} from '@/lib/supabase/domain-types'

export const planTransitions: Record<BusinessPlanStatus, BusinessPlanStatus[]> = {
  draft: ['active', 'cancelled', 'archived'],
  active: ['completed', 'cancelled', 'archived'],
  completed: ['active', 'archived'],
  cancelled: ['archived'],
  archived: ['draft'],
}

export const goalTransitions: Record<BusinessGoalStatus, BusinessGoalStatus[]> = {
  draft: ['active', 'cancelled'],
  active: ['achieved', 'missed', 'cancelled'],
  achieved: ['active'],
  missed: ['active'],
  cancelled: [],
}

export const initiativeTransitions: Record<BusinessInitiativeStatus, BusinessInitiativeStatus[]> = {
  planned: ['active', 'cancelled'],
  active: ['paused', 'completed', 'cancelled'],
  paused: ['active', 'cancelled'],
  completed: ['active'],
  cancelled: [],
}

export const actionTransitions: Record<ActionItemStatus, ActionItemStatus[]> = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['blocked', 'completed', 'cancelled'],
  blocked: ['in_progress', 'cancelled'],
  completed: ['in_progress'],
  cancelled: [],
}

export function requiresTransitionReason(targetStatus: string) {
  return ['blocked', 'missed', 'cancelled'].includes(targetStatus)
}
