import { describe, expect, it } from 'vitest'
import { EXERCISES } from '../data/exercises'
import type { CardioLog, WorkoutSession } from '../types'
import { CARDIO_TRACKING, cardioTotals, copyCardioInterval, findLastCardio, formatCardioInterval, isCardioEntry, newCardioLog, validateCardio } from './cardio'
import { computeDailyVolume } from './dailyActivity'
import { todayISO } from './date'
import { buildDaySummary } from './dayInsight'
import { computeMuscleVolume } from './muscleVolume'
import { exercisesWithHistory, strengthSeries } from './progress'

const session = (cardio: CardioLog, status: WorkoutSession['status'] = 'completed'): WorkoutSession => ({
  id: 'cardio', date: todayISO(), status, entries: [{ exerciseId: 'treadmill-run', sets: [], cardio }],
})

describe('cardio recording', () => {
  it('defines a measurement mode for every built-in cardio exercise', () => {
    expect(Object.keys(CARDIO_TRACKING).sort()).toEqual(EXERCISES.filter((e) => e.category === 'cardio').map((e) => e.id).sort())
    expect(newCardioLog('stair-climber', 'lb').tracking).toBe('steps')
    expect(newCardioLog('jump-rope', 'lb').tracking).toBe('jumps')
    expect(newCardioLog('burpees', 'lb').tracking).toBe('reps')
    expect(newCardioLog('mountain-climbers', 'lb').tracking).toBe('reps')
  })

  it('defaults running/cycling to preferred distance units and rowing to meters', () => {
    expect(newCardioLog('treadmill-run', 'lb').intervals[0].distanceUnit).toBe('mi')
    expect(newCardioLog('cycling', 'kg').intervals[0].distanceUnit).toBe('km')
    expect(newCardioLog('rowing-machine', 'lb').intervals[0].distanceUnit).toBe('m')
    expect(newCardioLog('custom-cardio', 'kg').tracking).toBe('distance')
  })

  it('copies interval measurements independently, without effort', () => {
    const original = { durationMinutes: 20, distance: 3.2, distanceUnit: 'km' as const, intensity: 8 }
    const next = copyCardioInterval(original)
    expect(next).toEqual({ durationMinutes: 20, distance: 3.2, distanceUnit: 'km' })
    next.distance = 4
    expect(original.distance).toBe(3.2)
  })

  it('requires duration for distance activities but allows untimed counted rounds', () => {
    expect(validateCardio(newCardioLog('cycling', 'kg'))).toMatch(/duration/)
    expect(validateCardio({ tracking: 'distance', intervals: [{ durationMinutes: 0.5 }] })).toBeNull()
    expect(validateCardio({ tracking: 'steps', intervals: [{ durationMinutes: 0, count: 100 }] })).toBeNull()
    expect(validateCardio({ tracking: 'reps', intervals: [{ durationMinutes: 2 }] })).toBeNull()
    expect(validateCardio({ tracking: 'jumps', intervals: [{ durationMinutes: 0 }] })).toMatch(/duration or jumps/)
    expect(validateCardio({ tracking: 'distance', intervals: [] })).toMatch(/at least one/)
  })

  it('rejects negative, non-finite, fractional counts and missing distance units', () => {
    for (const durationMinutes of [-1, NaN, Infinity]) {
      expect(validateCardio({ tracking: 'distance', intervals: [{ durationMinutes }] })).not.toBeNull()
    }
    expect(validateCardio({ tracking: 'steps', intervals: [{ durationMinutes: 1, count: 1.5 }] })).not.toBeNull()
    expect(validateCardio({ tracking: 'distance', intervals: [{ durationMinutes: 20, distance: 2 }] })).not.toBeNull()
  })

  it('formats cardio in the units recorded and survives JSON storage', () => {
    const log: CardioLog = { tracking: 'distance', intervals: [{ durationMinutes: 25.5, distance: 4, distanceUnit: 'mi', intensity: 7 }] }
    const restored: WorkoutSession = JSON.parse(JSON.stringify(session(log)))
    expect(restored.entries[0].cardio).toEqual(log)
    expect(formatCardioInterval(log.intervals[0], log.tracking)).toBe('25.5 min · 4 mi · RPE 7')
    expect(formatCardioInterval({ durationMinutes: 0, count: 50 }, 'jumps')).toBe('50 jumps')
  })
})

describe('cardio history and calculations', () => {
  const log: CardioLog = { tracking: 'distance', intervals: [
    { durationMinutes: 20, distance: 1, distanceUnit: 'mi', intensity: 6 },
    { durationMinutes: 10, distance: 500, distanceUnit: 'm', intensity: 8 },
  ] }

  it('keeps new and legacy cardio out of strength calculations', () => {
    const mixed = session(log)
    mixed.entries[0].sets = [{ reps: 30, weight: 100, unit: 'lb' }]
    mixed.entries.push({ exerciseId: 'barbell-bench-press', sets: [{ reps: 5, weight: 100, unit: 'lb' }] })
    expect(exercisesWithHistory([mixed])).toEqual(['barbell-bench-press'])
    expect(strengthSeries([mixed], 'treadmill-run', 'lb')).toEqual([])
    expect(computeDailyVolume([mixed], 1)[0].volume).toBe(500)
    expect(computeMuscleVolume([mixed]).quads).toBe(0)
    delete mixed.entries[0].cardio
    expect(isCardioEntry(mixed.entries[0])).toBe(true)
    expect(computeDailyVolume([mixed], 1)[0].volume).toBe(500)
  })

  it('sums compatible distances and counts completed cardio once per workout', () => {
    const mixed = session(log)
    mixed.entries.push({ exerciseId: 'stair-climber', sets: [], cardio: { tracking: 'steps', intervals: [{ durationMinutes: 5, count: 200 }] } })
    const totals = cardioTotals([mixed, session(log, 'planned')])
    expect(totals).toMatchObject({ minutes: 35, steps: 200, workouts: 1 })
    expect(totals.distanceKm).toBeCloseTo(2.109344)
  })

  it('uses interval RPE for coaching', () => {
    expect(buildDaySummary([session(log)])[0].avgRpe).toBe(7)
  })

  it('finds prior completed cardio without reinterpreting older reps/weights', () => {
    const old = session(log)
    old.date = '2026-01-01'
    const future = session(log)
    future.date = '2027-01-01'
    expect(findLastCardio([future, old, session(log, 'planned')], 'treadmill-run', '2026-02-01')?.date).toBe('2026-01-01')
    delete old.entries[0].cardio
    old.entries[0].sets = [{ reps: 30, weight: 5, unit: 'lb' }]
    expect(findLastCardio([old], 'treadmill-run', '2026-02-01')).toBeNull()
  })
})
