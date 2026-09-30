import { describe, expect, it } from 'vitest'
import type { WorkoutSession } from '../types'
import { duplicateAsPlan, nextWorkoutDate, validWorkoutDate } from './sessionSchedule'

describe('workout scheduling dates', () => {
  it('rejects empty, malformed and impossible dates', () => {
    for (const date of ['', '2026-2-01', '2026-02-29', '2026-04-31', '2026-13-01', '0000-01-01']) {
      expect(validWorkoutDate(date), date).toBe(false)
    }
    expect(validWorkoutDate('2028-02-29')).toBe(true)
    expect(validWorkoutDate('2026-09-27')).toBe(true)
  })

  it('defaults to the day after the workout across month, year and daylight-saving boundaries', () => {
    expect(nextWorkoutDate('2026-09-30')).toBe('2026-10-01')
    expect(nextWorkoutDate('2026-12-31')).toBe('2027-01-01')
    expect(nextWorkoutDate('2028-02-28')).toBe('2028-02-29')
    expect(nextWorkoutDate('2026-03-08')).toBe('2026-03-09')
    expect(nextWorkoutDate('2026-11-01')).toBe('2026-11-02')
  })
})

describe('duplicateAsPlan', () => {
  const source: WorkoutSession = {
    id: 'source', date: '2026-09-27', status: 'completed', notes: 'Push and cardio',
    entries: [
      { exerciseId: 'custom-press', sets: [{ reps: 8, weight: 50, unit: 'kg', intensity: 8 }] },
      { exerciseId: 'cycling', sets: [], cardio: { tracking: 'distance', intervals: [{ durationMinutes: 20, distance: 5, distanceUnit: 'mi', intensity: 7 }] } },
      { exerciseId: 'jump-rope', sets: [{ reps: 50, weight: 0, unit: 'lb', intensity: 6 }], cardio: { tracking: 'jumps', intervals: [{ durationMinutes: 3, count: 100, intensity: 9 }] } },
    ],
  }

  it('copies all workout measurements as a fresh plan without RPE or the original id', () => {
    const plan = duplicateAsPlan(source, '2026-09-28')
    expect(plan).not.toHaveProperty('id')
    expect(plan).toMatchObject({ date: '2026-09-28', status: 'planned', notes: source.notes })
    expect(plan.entries[0].sets).toEqual([{ reps: 8, weight: 50, unit: 'kg' }])
    expect(plan.entries[1].cardio).toEqual({ tracking: 'distance', intervals: [{ durationMinutes: 20, distance: 5, distanceUnit: 'mi' }] })
    expect(plan.entries[2].cardio?.intervals).toEqual([{ durationMinutes: 3, count: 100 }])
    expect(plan.entries[2].sets[0]).not.toHaveProperty('intensity')
  })

  it('does not alter the original or share editable nested records', () => {
    const original = JSON.stringify(source)
    const plan = duplicateAsPlan(source, '2026-09-28')
    plan.entries[0].sets[0].reps = 12
    plan.entries[1].cardio!.intervals[0].durationMinutes = 45
    plan.entries[2].cardio!.tracking = 'steps'
    expect(JSON.stringify(source)).toBe(original)
  })

  it('also duplicates a planned workout without changing its source date', () => {
    const planned = { ...source, status: 'planned' as const }
    expect(duplicateAsPlan(planned, '2026-10-01').status).toBe('planned')
    expect(planned.date).toBe('2026-09-27')
  })
})
