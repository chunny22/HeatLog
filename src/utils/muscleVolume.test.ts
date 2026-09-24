import { describe, expect, it } from 'vitest'
import type { SetEntry, WorkoutSession } from '../types'
import { computeMuscleVolume, normalizeVolumes, setVolume } from './muscleVolume'

const set = (reps: number, weight: number): SetEntry => ({ reps, weight, unit: 'lb' })
const session = (
  date: string,
  status: WorkoutSession['status'],
  exerciseId: string,
  sets: SetEntry[],
): WorkoutSession => ({ id: `${date}-${exerciseId}`, date, status, entries: [{ exerciseId, sets }] })

describe('setVolume', () => {
  it('multiplies reps by weight', () => {
    expect(setVolume(5, 100)).toBe(500)
  })

  it('counts bodyweight sets (weight 0) as one unit per rep', () => {
    expect(setVolume(10, 0)).toBe(10)
  })
})

describe('computeMuscleVolume', () => {
  // Barbell bench press: chest primary, front delts + triceps secondary.
  const bench = 'barbell-bench-press'

  it('gives primary muscles full volume and secondary muscles half', () => {
    const v = computeMuscleVolume([session('2026-09-01', 'completed', bench, [set(5, 100)])])
    expect(v.chest).toBe(500)
    expect(v.front_delts).toBe(250)
    expect(v.triceps).toBe(250)
    expect(v.quads).toBe(0)
  })

  it('ignores planned sessions', () => {
    const v = computeMuscleVolume([session('2026-09-01', 'planned', bench, [set(5, 100)])])
    expect(v.chest).toBe(0)
  })

  it('skips exercises it does not recognise instead of throwing', () => {
    const v = computeMuscleVolume([session('2026-09-01', 'completed', 'no-such-exercise', [set(5, 100)])])
    expect(Object.values(v).every((x) => x === 0)).toBe(true)
  })

  it('respects an inclusive start/end date range', () => {
    const sessions = [
      session('2026-09-01', 'completed', bench, [set(1, 100)]),
      session('2026-09-05', 'completed', bench, [set(1, 100)]),
      session('2026-09-10', 'completed', bench, [set(1, 100)]),
    ]
    expect(computeMuscleVolume(sessions, '2026-09-05', '2026-09-05').chest).toBe(100)
    expect(computeMuscleVolume(sessions, '2026-09-05').chest).toBe(200)
    expect(computeMuscleVolume(sessions, undefined, '2026-09-05').chest).toBe(200)
  })

  it('adds up across sessions and sets', () => {
    const sessions = [
      session('2026-09-01', 'completed', bench, [set(5, 100), set(5, 100)]),
      session('2026-09-02', 'completed', bench, [set(3, 200)]),
    ]
    expect(computeMuscleVolume(sessions).chest).toBe(1000 + 600)
  })
})

describe('normalizeVolumes', () => {
  it('scales so the largest muscle is 1', () => {
    const v = computeMuscleVolume([
      { id: 'a', date: '2026-09-01', status: 'completed', entries: [{ exerciseId: 'barbell-bench-press', sets: [set(5, 100)] }] },
    ])
    const n = normalizeVolumes(v)
    expect(n.chest).toBe(1)
    expect(n.triceps).toBe(0.5)
  })

  it('returns all zeros untouched (no divide by zero)', () => {
    const n = normalizeVolumes(computeMuscleVolume([]))
    expect(Object.values(n).every((x) => x === 0)).toBe(true)
  })
})
