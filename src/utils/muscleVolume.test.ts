import { describe, expect, it } from 'vitest'
import type { SetEntry, WorkoutSession } from '../types'
import { expandLegacyChest } from '../data/muscles'
import { computeMuscleVolume, normalizeVolumes, rpeFactor, setVolume } from './muscleVolume'

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
    expect(v.upper_chest).toBe(500)
    expect(v.mid_chest).toBe(500)
    expect(v.lower_chest).toBe(500)
    expect(v.front_delts).toBe(250)
    expect(v.triceps).toBe(250)
    expect(v.quads).toBe(0)
  })

  it('ignores planned sessions', () => {
    const v = computeMuscleVolume([session('2026-09-01', 'planned', bench, [set(5, 100)])])
    expect(v.upper_chest).toBe(0)
    expect(v.mid_chest).toBe(0)
    expect(v.lower_chest).toBe(0)
  })

  it.each(['incline-bench-press', 'incline-dumbbell-press'])('emphasizes upper chest for %s', (id) => {
    const v = computeMuscleVolume([session('2026-09-01', 'completed', id, [set(5, 100)])])
    expect(v.upper_chest).toBe(500)
    expect(v.mid_chest).toBe(250)
    expect(v.lower_chest).toBe(250)
    expect(normalizeVolumes(v).lower_chest).toBe(0.5)
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
    expect(computeMuscleVolume(sessions, '2026-09-05', '2026-09-05').upper_chest).toBe(100)
    expect(computeMuscleVolume(sessions, '2026-09-05').upper_chest).toBe(200)
    expect(computeMuscleVolume(sessions, undefined, '2026-09-05').upper_chest).toBe(200)
  })

  it('adds up across sessions and sets', () => {
    const sessions = [
      session('2026-09-01', 'completed', bench, [set(5, 100), set(5, 100)]),
      session('2026-09-02', 'completed', bench, [set(3, 200)]),
    ]
    expect(computeMuscleVolume(sessions).upper_chest).toBe(1000 + 600)
  })
})

describe('normalizeVolumes', () => {
  it('scales so the largest muscle is 1', () => {
    const v = computeMuscleVolume([
      { id: 'a', date: '2026-09-01', status: 'completed', entries: [{ exerciseId: 'barbell-bench-press', sets: [set(5, 100)] }] },
    ])
    const n = normalizeVolumes(v)
    expect(n.upper_chest).toBe(1)
    expect(n.triceps).toBe(0.5)
  })

  it('returns all zeros untouched (no divide by zero)', () => {
    const n = normalizeVolumes(computeMuscleVolume([]))
    expect(Object.values(n).every((x) => x === 0)).toBe(true)
  })
})

describe('computeMuscleVolume with custom exercises', () => {
  it.each(['upper_chest', 'mid_chest', 'lower_chest'] as const)('keeps a custom %s exercise isolated to its selected region', (group) => {
    const v = computeMuscleVolume(
      [session('2026-09-01', 'completed', 'custom-chest', [set(5, 100)])], undefined, undefined,
      { 'custom-chest': { id: 'custom-chest', name: 'Chest press', category: 'push', muscles: [{ group, role: 'primary' }] } },
    )
    expect(v[group]).toBe(500)
    for (const other of ['upper_chest', 'mid_chest', 'lower_chest'] as const) {
      if (other !== group) expect(v[other]).toBe(0)
    }
  })

  it('preserves whole-chest heatmap coverage for an older custom exercise', () => {
    const v = computeMuscleVolume(
      [session('2026-09-01', 'completed', 'custom-old', [set(5, 100)])], undefined, undefined,
      { 'custom-old': { id: 'custom-old', name: 'Old chest press', category: 'push', muscles: expandLegacyChest([{ group: 'chest', role: 'primary' }]) } },
    )
    expect(v.upper_chest).toBe(500)
    expect(v.mid_chest).toBe(500)
    expect(v.lower_chest).toBe(500)
  })

  const sledPush = {
    id: 'custom-1',
    name: 'Sled push',
    category: 'legs' as const,
    muscles: [
      { group: 'quads' as const, role: 'primary' as const },
      { group: 'glutes' as const, role: 'secondary' as const },
    ],
  }

  it('counts a custom exercise using the muscles its owner chose', () => {
    const v = computeMuscleVolume(
      [session('2026-09-01', 'completed', 'custom-1', [set(2, 100)])],
      undefined,
      undefined,
      { 'custom-1': sledPush },
    )
    expect(v.quads).toBe(200)
    expect(v.glutes).toBe(100)
    expect(v.upper_chest).toBe(0)
  })

  it('skips a custom id it has no definition for', () => {
    const v = computeMuscleVolume([session('2026-09-01', 'completed', 'custom-1', [set(2, 100)])])
    expect(Object.values(v).every((x) => x === 0)).toBe(true)
  })
})

describe('rpeFactor', () => {
  it('treats RPE 8 as normal and each point as 10%', () => {
    expect(rpeFactor(8)).toBe(1)
    expect(rpeFactor(10)).toBeCloseTo(1.2, 10)
    expect(rpeFactor(6)).toBeCloseTo(0.8, 10)
    expect(rpeFactor(1)).toBeCloseTo(0.3, 10)
  })

  it('is neutral when there is no RPE', () => {
    expect(rpeFactor(undefined)).toBe(1)
    expect(rpeFactor(0)).toBe(1)
    expect(rpeFactor(NaN)).toBe(1)
  })

  it('keeps out-of-range values inside 1-10', () => {
    expect(rpeFactor(15)).toBeCloseTo(1.2, 10)
  })
})

describe('computeMuscleVolume with RPE', () => {
  const bench = 'barbell-bench-press'
  const rated = (rpe: number | undefined): SetEntry => ({ reps: 5, weight: 100, unit: 'lb', intensity: rpe })
  const chest = (sets: SetEntry[]) =>
    computeMuscleVolume([session('2026-09-01', 'completed', bench, sets)]).upper_chest

  it('counts a harder set for more than an easier one with the same reps and weight', () => {
    expect(chest([rated(10)])).toBeCloseTo(600, 6)
    expect(chest([rated(6)])).toBeCloseTo(400, 6)
    expect(chest([rated(8)])).toBe(500)
  })

  it('leaves sets without an RPE unchanged', () => {
    expect(chest([rated(undefined)])).toBe(500)
  })
})
