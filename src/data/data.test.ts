import { describe, expect, it } from 'vitest'
import schema from '../../supabase/schema.sql?raw'
import { muscleColor } from '../utils/colorScale'
import { EXERCISES } from './exercises'
import { GOALS } from './goals'
import { ALL_MUSCLES, MUSCLE_LABELS } from './muscles'

describe('goals', () => {
  it('match the goal values the database allows (schema.sql check constraint)', () => {
    const match = schema.match(/goals <@ array\[([^\]]+)\]/)
    expect(match, 'goals check constraint not found in schema.sql').not.toBeNull()
    const allowed = [...match![1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort()
    expect(GOALS.map((g) => g.id).sort()).toEqual(allowed)
  })

  it('have unique ids', () => {
    expect(new Set(GOALS.map((g) => g.id)).size).toBe(GOALS.length)
  })
})

describe('exercise data', () => {
  it('has unique ids', () => {
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length)
  })

  it('only references muscles that exist and have labels', () => {
    for (const exercise of EXERCISES) {
      expect(exercise.muscles.length, exercise.id).toBeGreaterThan(0)
      for (const { group } of exercise.muscles) {
        expect(ALL_MUSCLES, `${exercise.id} -> ${group}`).toContain(group)
        expect(MUSCLE_LABELS[group], group).toBeTruthy()
      }
    }
  })
})

describe('muscleColor', () => {
  it('shows the "no data" colour for zero, negative or missing volume', () => {
    const none = muscleColor(0)
    expect(none).toBe('var(--c-nodata)')
    expect(muscleColor(-1)).toBe(none)
    expect(muscleColor(NaN)).toBe(none)
  })

  it('runs from amber at the low end to red at 1, clamping above it', () => {
    expect(muscleColor(0.0001)).toMatch(/^rgb\(25[0-3], 2\d\d, 1\d\d\)$/)
    expect(muscleColor(1)).toBe('rgb(220, 38, 38)')
    expect(muscleColor(5)).toBe('rgb(220, 38, 38)')
  })
})
