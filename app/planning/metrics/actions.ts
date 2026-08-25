'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createGoalTarget,
  createMetricDefinition,
  createMetricMeasurement,
  type PlanningMutationResult,
} from '@/lib/planning/service'
import { planningErrorMessage } from '@/app/planning/_lib/mutation-feedback'
import {
  createGoalTargetSchema,
  createMetricDefinitionSchema,
  createMetricMeasurementSchema,
} from '@/app/planning/metrics/schemas'

function value(formData: FormData, key: string) {
  return formData.get(key)?.toString()
}

function invalid(message = 'Data metrik belum lengkap atau formatnya tidak valid.'): never {
  redirect(`/planning/metrics?error=${encodeURIComponent(message)}`)
}

function finish(result: PlanningMutationResult, success: string): never {
  if (result.error) {
    console.error('[planning.metric.mutation.failed]', {
      code: result.error.code,
      message: result.error.message,
    })
    redirect(`/planning/metrics?error=${encodeURIComponent(planningErrorMessage(result.error.message))}`)
  }

  revalidatePath('/planning')
  revalidatePath('/planning/metrics')
  revalidatePath('/planning/reviews')
  revalidatePath('/dashboard')
  redirect(`/planning/metrics?success=${encodeURIComponent(success)}`)
}

export async function createMetricDefinitionAction(formData: FormData) {
  const parsed = createMetricDefinitionSchema.safeParse({
    code: value(formData, 'code'),
    name: value(formData, 'name'),
    description: value(formData, 'description'),
    unitType: value(formData, 'unitType'),
    unitLabel: value(formData, 'unitLabel'),
    aggregation: value(formData, 'aggregation'),
    authoritativeSource: value(formData, 'authoritativeSource'),
    reconciliationTolerancePercent: value(formData, 'reconciliationTolerancePercent'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createMetricDefinition({
      code: parsed.data.code,
      name: parsed.data.name,
      description: parsed.data.description,
      unit_type: parsed.data.unitType,
      unit_label: parsed.data.unitLabel,
      aggregation: parsed.data.aggregation,
      authoritative_source: parsed.data.authoritativeSource,
      reconciliation_tolerance_percent: parsed.data.reconciliationTolerancePercent,
    }),
    'Definisi metrik berhasil dibuat.',
  )
}

export async function createGoalTargetAction(formData: FormData) {
  const parsed = createGoalTargetSchema.safeParse({
    businessGoalId: value(formData, 'businessGoalId'),
    metricDefinitionId: value(formData, 'metricDefinitionId'),
    startingValue: value(formData, 'startingValue'),
    targetValue: value(formData, 'targetValue'),
    direction: value(formData, 'direction'),
    targetDate: value(formData, 'targetDate'),
    weightPercent: value(formData, 'weightPercent'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createGoalTarget({
      business_goal_id: parsed.data.businessGoalId,
      metric_definition_id: parsed.data.metricDefinitionId,
      starting_value: parsed.data.startingValue,
      target_value: parsed.data.targetValue,
      direction: parsed.data.direction,
      target_date: parsed.data.targetDate,
      weight_percent: parsed.data.weightPercent,
    }),
    'Target terukur berhasil ditambahkan.',
  )
}

export async function createMetricMeasurementAction(formData: FormData) {
  const parsed = createMetricMeasurementSchema.safeParse({
    goalTargetId: value(formData, 'goalTargetId'),
    measuredValue: value(formData, 'measuredValue'),
    measuredAt: value(formData, 'measuredAt'),
    source: value(formData, 'source'),
    note: value(formData, 'note'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createMetricMeasurement({
      goal_target_id: parsed.data.goalTargetId,
      measured_value: parsed.data.measuredValue,
      measured_at: new Date(parsed.data.measuredAt).toISOString(),
      source: parsed.data.source,
      note: parsed.data.note,
    }),
    'Hasil aktual berhasil dicatat.',
  )
}
