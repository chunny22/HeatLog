import { describe, expect, it } from 'vitest'
import type { WorkoutSession } from '../types'
import { buildDaySummary, fingerprintSessions } from './dayInsight'

const make = (id: string, status: WorkoutSession['status'], exerciseIds: string[], reps = 5): WorkoutSession => ({
  id,
  date: '2026-09-01',
  status,
  entries: exerciseIds.map((exerciseId) => ({ exerciseId, sets: [{ reps, weight: 100, unit: 'lb' as const }] })),
})

describe('fingerprintSessions', () => {
  it('is the same regardless of session or exercise order', () => {
    const a = fingerprintSessions([make('1', 'completed', ['x', 'y']), make('2', 'planned', ['z'])])
    const b = fingerprintSessions([make('2', 'planned', ['z']), make('1', 'completed', ['y', 'x'])])
    expect(a).toBe(b)
  })

  it('ignores reps, weight and RPE so tweaking a number keeps a cached insight', () => {
    expect(fingerprintSessions([make('1', 'completed', ['x'], 5)])).toBe(
      fingerprintSessions([make('1', 'completed', ['x'], 12)]),
    )
  })

  it('changes when the status, exercises or sessions change', () => {
    const base = fingerprintSessions([make('1', 'planned', ['x'])])
    expect(fingerprintSessions([make('1', 'completed', ['x'])])).not.toBe(base)
    expect(fingerprintSessions([make('1', 'planned', ['x', 'y'])])).not.toBe(base)
    expect(fingerprintSessions([make('1', 'planned', ['x']), make('2', 'planned', ['x'])])).not.toBe(base)
  })

  it('handles a day with no sessions', () => {
    expect(fingerprintSessions([])).toBe('')
  })

  it('collapses a repeated exercise within one session', () => {
    expect(fingerprintSessions([make('1', 'completed', ['x', 'x'])])).toBe(
      fingerprintSessions([make('1', 'completed', ['x'])]),
    )
  })
})

describe('buildDaySummary', () => {
  it('lists each distinct known exercise once with readable muscle names', () => {
    const summary = buildDaySummary([
      make('1', 'completed', ['barbell-bench-press']),
      make('2', 'completed', ['barbell-bench-press', 'unknown-exercise']),
    ])
    expect(summary).toHaveLength(1)
    expect(summary[0].name).toBe('Barbell Bench Press')
    expect(summary[0].category).toBe('push')
    expect(summary[0].muscles.length).toBeGreaterThan(0)
    expect(new Set(summary[0].muscles).size).toBe(summary[0].muscles.length)
  })
})
