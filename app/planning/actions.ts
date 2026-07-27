'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createActionItem,
  createBusinessGoal,
  createBusinessInitiative,
  createBusinessPlan,
  setPlanningRecordArchived,
  transitionActionItem,
  transitionBusinessGoal,
  transitionBusinessInitiative,
  transitionBusinessPlan,
  type PlanningMutationResult,
} from '@/lib/planning/service'
import type {
  ActionItemStatus,
  BusinessGoalStatus,
  BusinessInitiativeStatus,
  BusinessPlanStatus,
} from '@/lib/supabase/domain-types'
import {
  archiveSchema,
  createActionSchema,
  createGoalSchema,
  createInitiativeSchema,
  createPlanSchema,
  transitionSchema,
} from '@/app/planning/_lib/planning-schemas'
import { planningErrorMessage } from '@/app/planning/_lib/mutation-feedback'

function value(formData: FormData, key: string) {
  return formData.get(key)?.toString()
}

function invalid(message = 'Data belum lengkap atau formatnya tidak valid.'): never {
  redirect(`/planning?error=${encodeURIComponent(message)}`)
}

function finish(result: PlanningMutationResult, success: string): never {
  if (result.error) {
    console.error('[planning.mutation.failed]', {
      code: result.error.code,
      message: result.error.message,
    })
    redirect(`/planning?error=${encodeURIComponent(planningErrorMessage(result.error.message))}`)
  }

  revalidatePath('/planning')
  redirect(`/planning?success=${encodeURIComponent(success)}`)
}

export async function createPlanAction(formData: FormData) {
  const parsed = createPlanSchema.safeParse({
    title: value(formData, 'title'),
    description: value(formData, 'description'),
    startsOn: value(formData, 'startsOn'),
    endsOn: value(formData, 'endsOn'),
    visibility: value(formData, 'visibility'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createBusinessPlan({
      title: parsed.data.title,
      description: parsed.data.description,
      starts_on: parsed.data.startsOn,
      ends_on: parsed.data.endsOn,
      visibility: parsed.data.visibility,
    }),
    'Rencana bisnis dibuat sebagai draft.',
  )
}

export async function createGoalAction(formData: FormData) {
  const parsed = createGoalSchema.safeParse({
    businessPlanId: value(formData, 'businessPlanId'),
    title: value(formData, 'title'),
    description: value(formData, 'description'),
    targetDate: value(formData, 'targetDate'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createBusinessGoal({
      business_plan_id: parsed.data.businessPlanId,
      title: parsed.data.title,
      description: parsed.data.description,
      target_date: parsed.data.targetDate,
    }),
    'Target ditambahkan sebagai draft.',
  )
}

export async function createInitiativeAction(formData: FormData) {
  const parsed = createInitiativeSchema.safeParse({
    businessPlanId: value(formData, 'businessPlanId'),
    businessGoalId: value(formData, 'businessGoalId'),
    title: value(formData, 'title'),
    description: value(formData, 'description'),
    startsOn: value(formData, 'startsOn'),
    endsOn: value(formData, 'endsOn'),
    budgetAmount: value(formData, 'budgetAmount'),
    unlinkedGoalContext: value(formData, 'unlinkedGoalContext'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createBusinessInitiative({
      business_plan_id: parsed.data.businessPlanId,
      business_goal_id: parsed.data.businessGoalId,
      title: parsed.data.title,
      description: parsed.data.description,
      starts_on: parsed.data.startsOn,
      ends_on: parsed.data.endsOn,
      budget_amount: parsed.data.budgetAmount,
      unlinked_goal_context: parsed.data.businessGoalId ? undefined : parsed.data.unlinkedGoalContext,
    }),
    'Initiative ditambahkan sebagai planned.',
  )
}

export async function createActionItemAction(formData: FormData) {
  const parsed = createActionSchema.safeParse({
    businessInitiativeId: value(formData, 'businessInitiativeId'),
    title: value(formData, 'title'),
    description: value(formData, 'description'),
    priority: value(formData, 'priority'),
    assigneeId: value(formData, 'assigneeId'),
    startsOn: value(formData, 'startsOn'),
    dueOn: value(formData, 'dueOn'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createActionItem({
      business_initiative_id: parsed.data.businessInitiativeId,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      assignee_id: parsed.data.assigneeId,
      starts_on: parsed.data.startsOn,
      due_on: parsed.data.dueOn,
    }),
    'Tindakan ditambahkan sebagai todo.',
  )
}

export async function transitionPlanningRecordAction(formData: FormData) {
  const parsed = transitionSchema.safeParse({
    recordType: value(formData, 'recordType'),
    recordId: value(formData, 'recordId'),
    targetStatus: value(formData, 'targetStatus'),
    reason: value(formData, 'reason'),
    replacementTargetDate: value(formData, 'replacementTargetDate'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  let result: PlanningMutationResult
  switch (parsed.data.recordType) {
    case 'business_plan':
      result = await transitionBusinessPlan(
        parsed.data.recordId,
        parsed.data.targetStatus as BusinessPlanStatus,
        parsed.data.reason,
      )
      break
    case 'business_goal':
      result = await transitionBusinessGoal(
        parsed.data.recordId,
        parsed.data.targetStatus as BusinessGoalStatus,
        parsed.data.reason,
        parsed.data.replacementTargetDate,
      )
      break
    case 'business_initiative':
      result = await transitionBusinessInitiative(
        parsed.data.recordId,
        parsed.data.targetStatus as BusinessInitiativeStatus,
        parsed.data.reason,
      )
      break
    case 'action_item':
      result = await transitionActionItem(
        parsed.data.recordId,
        parsed.data.targetStatus as ActionItemStatus,
        parsed.data.reason,
      )
      break
  }

  finish(result, `Status berhasil diubah menjadi ${parsed.data.targetStatus}.`)
}

export async function setPlanningArchiveAction(formData: FormData) {
  const parsed = archiveSchema.safeParse({
    recordType: value(formData, 'recordType'),
    recordId: value(formData, 'recordId'),
    shouldArchive: value(formData, 'shouldArchive'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await setPlanningRecordArchived(parsed.data.recordType, parsed.data.recordId, parsed.data.shouldArchive),
    parsed.data.shouldArchive ? 'Data dipindahkan ke arsip.' : 'Data berhasil dipulihkan.',
  )
}
