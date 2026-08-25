import { z } from 'zod'

const databaseUuid = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'ID data tidak valid.')

const optionalNumber = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : undefined),
  z.number().finite().optional(),
)

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() ? value.trim() : undefined),
    z.string().max(maximum).optional(),
  )

export const createMetricDefinitionSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, 'Kode memakai huruf kecil, angka, dan underscore.'),
  name: z.string().trim().min(2).max(100),
  description: optionalText(500),
  unitType: z.enum(['number', 'currency', 'percentage']),
  unitLabel: optionalText(30),
  aggregation: z.enum(['sum', 'average', 'latest', 'minimum', 'maximum', 'count']),
  authoritativeSource: z.enum(['manual', 'transaction']),
  reconciliationTolerancePercent: z.coerce.number().min(0).max(100),
})

export const createGoalTargetSchema = z.object({
  businessGoalId: databaseUuid,
  metricDefinitionId: databaseUuid,
  startingValue: optionalNumber,
  targetValue: z.coerce.number().finite(),
  direction: z.enum(['increase', 'decrease', 'maintain']),
  targetDate: z.preprocess(
    (value) => (typeof value === 'string' && value ? value : undefined),
    z.iso.date().optional(),
  ),
  weightPercent: z.coerce.number().positive().max(100),
})

export const createMetricMeasurementSchema = z.object({
  goalTargetId: databaseUuid,
  measuredValue: z.coerce.number().finite(),
  measuredAt: z.iso.datetime({ local: true }),
  source: z.string().trim().min(2).max(50),
  note: optionalText(500),
})

export const createTransactionContributionSchema = z.object({
  transactionId: databaseUuid,
  goalTargetId: databaseUuid,
  contributionValue: z.coerce
    .number()
    .finite()
    .refine((value) => value !== 0, 'Kontribusi tidak boleh nol.'),
  note: optionalText(500),
})
