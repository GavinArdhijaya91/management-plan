import { describe, expect, it } from 'vitest'
import { createGoalTargetSchema, createMetricDefinitionSchema, createMetricMeasurementSchema } from './schemas'

const goalId = 'a1900000-0000-0000-0000-000000000002'
const metricId = 'a1900000-0000-0000-0000-000000000006'

describe('planning metric schemas', () => {
  it('accepts an explicit metric evidence contract', () => {
    const parsed = createMetricDefinitionSchema.parse({
      code: 'omzet_bulanan',
      name: 'Omzet bulanan',
      description: 'Total penjualan pada periode berjalan.',
      unitType: 'currency',
      unitLabel: 'IDR',
      aggregation: 'sum',
      authoritativeSource: 'transaction',
      reconciliationTolerancePercent: '5',
    })

    expect(parsed.authoritativeSource).toBe('transaction')
    expect(parsed.reconciliationTolerancePercent).toBe(5)
  })

  it('rejects ambiguous metric codes and tolerance outside the contract', () => {
    const parsed = createMetricDefinitionSchema.safeParse({
      code: 'Omzet Bulanan',
      name: 'Omzet bulanan',
      unitType: 'currency',
      aggregation: 'sum',
      authoritativeSource: 'manual',
      reconciliationTolerancePercent: '101',
    })

    expect(parsed.success).toBe(false)
  })

  it('coerces numeric target values without inventing a starting value', () => {
    const parsed = createGoalTargetSchema.parse({
      businessGoalId: goalId,
      metricDefinitionId: metricId,
      startingValue: '',
      targetValue: '25000000',
      direction: 'increase',
      targetDate: '2026-09-30',
      weightPercent: '100',
    })

    expect(parsed.startingValue).toBeUndefined()
    expect(parsed.targetValue).toBe(25_000_000)
  })

  it('requires a factual measurement time and bounded source label', () => {
    expect(
      createMetricMeasurementSchema.safeParse({
        goalTargetId: goalId,
        measuredValue: '15000000',
        measuredAt: '2026-08-25T09:00',
        source: 'Rekap kas harian',
      }).success,
    ).toBe(true)

    expect(
      createMetricMeasurementSchema.safeParse({
        goalTargetId: goalId,
        measuredValue: '15000000',
        measuredAt: 'not-a-date',
        source: 'x',
      }).success,
    ).toBe(false)
  })
})
