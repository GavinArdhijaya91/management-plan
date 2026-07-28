import { describe, expect, it } from 'vitest'
import {
  actionTransitions,
  goalTransitions,
  initiativeTransitions,
  planTransitions,
  requiresTransitionReason,
} from './lifecycle'
import { planningErrorMessage } from './mutation-feedback'
import { createInitiativeSchema, createPlanSchema, transitionSchema } from './planning-schemas'

describe('planning lifecycle contract', () => {
  it('exposes only database-approved transition edges', () => {
    expect(planTransitions.draft).toEqual(['active', 'cancelled', 'archived'])
    expect(planTransitions.cancelled).toEqual(['archived'])
    expect(goalTransitions.missed).toEqual(['active'])
    expect(initiativeTransitions.cancelled).toEqual([])
    expect(actionTransitions.completed).toEqual(['in_progress'])
  })

  it('marks reason-sensitive transitions', () => {
    expect(requiresTransitionReason('blocked')).toBe(true)
    expect(requiresTransitionReason('missed')).toBe(true)
    expect(requiresTransitionReason('cancelled')).toBe(true)
    expect(requiresTransitionReason('active')).toBe(false)
  })
})

describe('planning mutation validation', () => {
  it('rejects an inverted plan period', () => {
    const result = createPlanSchema.safeParse({
      title: 'Rencana tahunan',
      startsOn: '2027-01-01',
      endsOn: '2026-01-01',
      visibility: 'workspace',
    })
    expect(result.success).toBe(false)
  })

  it('requires context for an initiative without a goal', () => {
    const result = createInitiativeSchema.safeParse({
      businessPlanId: 'a1910000-0000-0000-0000-000000000001',
      title: 'Eksperimen mandiri',
    })
    expect(result.success).toBe(false)
  })

  it('accepts a goal-linked initiative without independent context', () => {
    const result = createInitiativeSchema.safeParse({
      businessPlanId: 'a1910000-0000-0000-0000-000000000001',
      businessGoalId: 'a1910000-0000-0000-0000-000000000002',
      title: 'Eksperimen terarah',
    })
    expect(result.success).toBe(true)
  })

  it('rejects a status belonging to another planning record type', () => {
    const result = transitionSchema.safeParse({
      recordType: 'business_plan',
      recordId: 'a1910000-0000-0000-0000-000000000001',
      targetStatus: 'in_progress',
    })

    expect(result.success).toBe(false)
  })

  it('requires a specific reason for reason-sensitive transitions', () => {
    const missingReason = transitionSchema.safeParse({
      recordType: 'action_item',
      recordId: 'a1910000-0000-0000-0000-000000000001',
      targetStatus: 'blocked',
    })
    const shortReason = transitionSchema.safeParse({
      recordType: 'business_goal',
      recordId: 'a1910000-0000-0000-0000-000000000001',
      targetStatus: 'missed',
      reason: 'no',
    })

    expect(missingReason.success).toBe(false)
    expect(shortReason.success).toBe(false)
  })
})

describe('planning error feedback', () => {
  it('translates database invariants into actionable UI guidance', () => {
    expect(planningErrorMessage('A business plan requires at least one goal before activation')).toContain(
      'minimal satu target',
    )
    expect(planningErrorMessage('Not authorized to transition this action item')).toContain('permission')
  })
})
