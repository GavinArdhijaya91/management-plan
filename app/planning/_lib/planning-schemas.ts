import { z } from 'zod'

const databaseUuid = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'ID data tidak valid.')

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().max(maximum).optional(),
  )

const optionalDate = z.preprocess(
  (value) => (typeof value === 'string' && value ? value : undefined),
  z.iso.date().optional(),
)

export const createPlanSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    description: optionalText(2000),
    startsOn: z.iso.date(),
    endsOn: z.iso.date(),
    visibility: z.enum(['workspace', 'restricted']),
  })
  .refine((input) => input.endsOn >= input.startsOn, {
    message: 'Tanggal selesai tidak boleh mendahului tanggal mulai.',
  })

export const createGoalSchema = z.object({
  businessPlanId: databaseUuid,
  title: z.string().trim().min(2).max(160),
  description: optionalText(1500),
  targetDate: optionalDate,
})

export const createInitiativeSchema = z
  .object({
    businessPlanId: databaseUuid,
    businessGoalId: z.preprocess(
      (value) => (typeof value === 'string' && value ? value : undefined),
      databaseUuid.optional(),
    ),
    title: z.string().trim().min(2).max(160),
    description: optionalText(1500),
    startsOn: optionalDate,
    endsOn: optionalDate,
    budgetAmount: z.preprocess(
      (value) => (typeof value === 'string' && value ? Number(value) : undefined),
      z.number().nonnegative().optional(),
    ),
    unlinkedGoalContext: optionalText(1000),
  })
  .superRefine((input, context) => {
    if (!input.businessGoalId && (!input.unlinkedGoalContext || input.unlinkedGoalContext.length < 5)) {
      context.addIssue({
        code: 'custom',
        path: ['unlinkedGoalContext'],
        message: 'Jelaskan konteks initiative yang tidak terhubung ke target.',
      })
    }
    if (input.businessGoalId && input.unlinkedGoalContext) {
      context.addIssue({
        code: 'custom',
        path: ['unlinkedGoalContext'],
        message: 'Konteks mandiri tidak diperlukan jika target sudah dipilih.',
      })
    }
    if (input.startsOn && input.endsOn && input.endsOn < input.startsOn) {
      context.addIssue({
        code: 'custom',
        path: ['endsOn'],
        message: 'Tanggal selesai tidak boleh mendahului tanggal mulai.',
      })
    }
  })

export const createActionSchema = z.object({
  businessInitiativeId: databaseUuid,
  title: z.string().trim().min(2).max(160),
  description: optionalText(1000),
  priority: z.coerce.number().int().min(1).max(4),
  assigneeId: databaseUuid,
  startsOn: optionalDate,
  dueOn: z.iso.date(),
})

export const transitionSchema = z.object({
  recordType: z.enum(['business_plan', 'business_goal', 'business_initiative', 'action_item']),
  recordId: databaseUuid,
  targetStatus: z.string().min(2).max(30),
  reason: optionalText(1000),
  replacementTargetDate: optionalDate,
})

export const archiveSchema = z.object({
  recordType: z.enum(['business_goal', 'business_initiative', 'action_item']),
  recordId: databaseUuid,
  shouldArchive: z.enum(['true', 'false']).transform((value) => value === 'true'),
})
