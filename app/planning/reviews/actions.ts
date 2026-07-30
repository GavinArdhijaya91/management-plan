'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  createBusinessReview,
  finalizeBusinessReview,
  refreshBusinessReview,
  type PlanningMutationResult,
} from '@/lib/planning/service'
import { planningErrorMessage } from '@/app/planning/_lib/mutation-feedback'

const databaseUuid = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'ID data tidak valid.')

const reviewSchema = z
  .object({
    businessPlanId: databaseUuid,
    periodType: z.enum(['weekly', 'monthly', 'quarterly', 'annual', 'custom']),
    periodStart: z.iso.date(),
    periodEnd: z.iso.date(),
    summary: z.string().trim().min(10).max(3000),
    wins: z.string().trim().max(3000).optional(),
    challenges: z.string().trim().max(3000).optional(),
    nextSteps: z.string().trim().max(3000).optional(),
  })
  .refine((input) => input.periodEnd >= input.periodStart, {
    message: 'Akhir periode tidak boleh mendahului awal periode.',
  })

function value(formData: FormData, key: string) {
  return formData.get(key)?.toString()
}

function optionalValue(formData: FormData, key: string) {
  const input = value(formData, key)?.trim()
  return input || undefined
}

function invalid(message = 'Data evaluasi belum lengkap atau tidak valid.'): never {
  redirect(`/planning/reviews?error=${encodeURIComponent(message)}`)
}

function finish(result: PlanningMutationResult, success: string): never {
  if (result.error) {
    console.error('[business-review.mutation.failed]', {
      code: result.error.code,
      message: result.error.message,
    })
    redirect(`/planning/reviews?error=${encodeURIComponent(planningErrorMessage(result.error.message))}`)
  }

  revalidatePath('/planning/reviews')
  redirect(`/planning/reviews?success=${encodeURIComponent(success)}`)
}

export async function createBusinessReviewAction(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    businessPlanId: value(formData, 'businessPlanId'),
    periodType: value(formData, 'periodType'),
    periodStart: value(formData, 'periodStart'),
    periodEnd: value(formData, 'periodEnd'),
    summary: value(formData, 'summary'),
    wins: optionalValue(formData, 'wins'),
    challenges: optionalValue(formData, 'challenges'),
    nextSteps: optionalValue(formData, 'nextSteps'),
  })
  if (!parsed.success) invalid(parsed.error.issues[0]?.message)

  finish(
    await createBusinessReview({
      business_plan_id: parsed.data.businessPlanId,
      period_type: parsed.data.periodType,
      period_start: parsed.data.periodStart,
      period_end: parsed.data.periodEnd,
      summary: parsed.data.summary,
      wins: parsed.data.wins,
      challenges: parsed.data.challenges,
      next_steps: parsed.data.nextSteps,
    }),
    'Draft evaluasi berhasil dibuat.',
  )
}

export async function refreshBusinessReviewAction(formData: FormData) {
  const reviewId = databaseUuid.safeParse(value(formData, 'reviewId'))
  if (!reviewId.success) invalid(reviewId.error.issues[0]?.message)
  finish(await refreshBusinessReview(reviewId.data), 'Evidence dan pemeriksaan kesiapan telah diperbarui.')
}

export async function finalizeBusinessReviewAction(formData: FormData) {
  const reviewId = databaseUuid.safeParse(value(formData, 'reviewId'))
  if (!reviewId.success) invalid(reviewId.error.issues[0]?.message)

  const acknowledgeWarnings = formData.get('acknowledgeWarnings') === 'on'
  finish(
    await finalizeBusinessReview(reviewId.data, acknowledgeWarnings),
    'Evaluasi difinalisasi dan evidence telah dikunci.',
  )
}
