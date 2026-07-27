import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { requireAuthenticatedUser } from '@/lib/auth/session'
import { requireActiveWorkspace } from '@/lib/workspace/context'
import type {
  ActionItemStatus,
  BusinessGoalStatus,
  BusinessInitiativeStatus,
  BusinessPlanStatus,
  PlanningRecordType,
} from '@/lib/supabase/domain-types'
import type { TablesInsert } from '@/lib/supabase/database.types'

export interface PlanningMutationResult {
  error: { code?: string; message: string } | null
}

export async function getPlanningBoard() {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/planning'),
    requireActiveWorkspace('/planning'),
  ])
  const supabase = await createClient()

  const [plansResult, goalsResult, initiativesResult, actionsResult, membersResult] = await Promise.all([
    supabase
      .from('business_plans')
      .select('*')
      .eq('workspace_id', workspace.workspace_id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('business_goals')
      .select('*')
      .eq('workspace_id', workspace.workspace_id)
      .order('target_date', { ascending: true }),
    supabase
      .from('business_initiatives')
      .select('*')
      .eq('workspace_id', workspace.workspace_id)
      .order('created_at', { ascending: true }),
    supabase
      .from('action_items')
      .select('*')
      .eq('workspace_id', workspace.workspace_id)
      .order('due_on', { ascending: true }),
    supabase.rpc('get_workspace_member_directory', {
      target_workspace_id: workspace.workspace_id,
    }),
  ])

  const error =
    plansResult.error ?? goalsResult.error ?? initiativesResult.error ?? actionsResult.error ?? membersResult.error
  if (error) throw new Error(`Unable to load Planning workspace: ${error.message}`)

  return {
    userId: user.id,
    workspace,
    plans: plansResult.data ?? [],
    goals: goalsResult.data ?? [],
    initiatives: initiativesResult.data ?? [],
    actions: actionsResult.data ?? [],
    members: (membersResult.data ?? []).filter((member) => member.membership_status === 'active'),
  }
}

async function planningMutationContext() {
  const [user, workspace] = await Promise.all([
    requireAuthenticatedUser('/planning'),
    requireActiveWorkspace('/planning'),
  ])
  return { user, workspace, supabase: await createClient() }
}

export async function createBusinessPlan(
  input: Omit<TablesInsert<'business_plans'>, 'workspace_id' | 'created_by' | 'owner_id' | 'status'>,
): Promise<PlanningMutationResult> {
  const { user, workspace, supabase } = await planningMutationContext()
  const { error } = await supabase.from('business_plans').insert({
    ...input,
    workspace_id: workspace.workspace_id,
    created_by: user.id,
    owner_id: user.id,
    status: 'draft',
  })
  return { error }
}

export async function createBusinessGoal(
  input: Omit<TablesInsert<'business_goals'>, 'workspace_id' | 'created_by' | 'owner_id' | 'status'>,
): Promise<PlanningMutationResult> {
  const { user, workspace, supabase } = await planningMutationContext()
  const { error } = await supabase.from('business_goals').insert({
    ...input,
    workspace_id: workspace.workspace_id,
    created_by: user.id,
    owner_id: user.id,
    status: 'draft',
  })
  return { error }
}

export async function createBusinessInitiative(
  input: Omit<TablesInsert<'business_initiatives'>, 'workspace_id' | 'created_by' | 'owner_id' | 'status'>,
): Promise<PlanningMutationResult> {
  const { user, workspace, supabase } = await planningMutationContext()
  const { error } = await supabase.from('business_initiatives').insert({
    ...input,
    workspace_id: workspace.workspace_id,
    created_by: user.id,
    owner_id: user.id,
    status: 'planned',
  })
  return { error }
}

export async function createActionItem(
  input: Omit<
    TablesInsert<'action_items'>,
    | 'workspace_id'
    | 'created_by'
    | 'status'
    | 'archived_at'
    | 'archived_by'
    | 'blocked_at'
    | 'blocked_reason'
    | 'completed_at'
    | 'reopened_at'
    | 'reopened_by'
    | 'status_reason'
  >,
): Promise<PlanningMutationResult> {
  const { user, workspace, supabase } = await planningMutationContext()
  const { error } = await supabase.from('action_items').insert({
    ...input,
    workspace_id: workspace.workspace_id,
    created_by: user.id,
    status: 'todo',
  })
  return { error }
}

export async function transitionBusinessPlan(
  targetBusinessPlanId: string,
  targetStatus: BusinessPlanStatus,
  transitionReason?: string,
): Promise<PlanningMutationResult> {
  const { supabase } = await planningMutationContext()
  const { error } = await supabase.rpc('transition_business_plan', {
    target_business_plan_id: targetBusinessPlanId,
    target_status: targetStatus,
    transition_reason: transitionReason,
  })
  return { error }
}

export async function transitionBusinessGoal(
  targetBusinessGoalId: string,
  targetStatus: BusinessGoalStatus,
  transitionReason?: string,
  replacementTargetDate?: string,
): Promise<PlanningMutationResult> {
  const { supabase } = await planningMutationContext()
  const { error } = await supabase.rpc('transition_business_goal', {
    target_business_goal_id: targetBusinessGoalId,
    target_status: targetStatus,
    transition_reason: transitionReason,
    replacement_target_date: replacementTargetDate,
  })
  return { error }
}

export async function transitionBusinessInitiative(
  targetBusinessInitiativeId: string,
  targetStatus: BusinessInitiativeStatus,
  transitionReason?: string,
): Promise<PlanningMutationResult> {
  const { supabase } = await planningMutationContext()
  const { error } = await supabase.rpc('transition_business_initiative', {
    target_business_initiative_id: targetBusinessInitiativeId,
    target_status: targetStatus,
    transition_reason: transitionReason,
  })
  return { error }
}

export async function transitionActionItem(
  targetActionItemId: string,
  targetStatus: ActionItemStatus,
  transitionReason?: string,
): Promise<PlanningMutationResult> {
  const { supabase } = await planningMutationContext()
  const { error } = await supabase.rpc('transition_action_item', {
    target_action_item_id: targetActionItemId,
    target_status: targetStatus,
    transition_reason: transitionReason,
  })
  return { error }
}

export async function setPlanningRecordArchived(
  targetRecordType: PlanningRecordType,
  targetRecordId: string,
  shouldArchive: boolean,
): Promise<PlanningMutationResult> {
  const { supabase } = await planningMutationContext()
  const { error } = await supabase.rpc('set_planning_record_archived', {
    target_record_type: targetRecordType,
    target_record_id: targetRecordId,
    should_archive: shouldArchive,
  })
  return { error }
}
