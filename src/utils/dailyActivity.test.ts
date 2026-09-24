import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SetEntry, WorkoutSession } from '../types'
import { computeDailyVolume, findLeastActiveDay, findMostActiveDay } from './dailyActivity'
import { filterByRange } from './range'

const set = (reps: number, weight: number): SetEntry => ({ reps, weight, unit: 'lb' })
const session = (date: string, status: WorkoutSession['status'], sets: SetEntry[]): WorkoutSession => ({
  id: `${date}-${status}`,
  date,
  status,
  entries: [{ exerciseId: 'barbell-bench-press', sets }],
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 8, 23, 12, 0))
})
afterEach(() => {
  vi.useRealTimers()
})

describe('computeDailyVolume', () => {
  it('returns one entry per day, oldest first, ending today', () => {
    const series = computeDailyVolume([], 7)
    expect(series).toHaveLength(7)
    expect(series[0].date).toBe('2026-09-17')
    expect(series[6].date).toBe('2026-09-23')
    expect(series.every((d) => d.volume === 0)).toBe(true)
  })

  it('sums completed volume per day, including several sessions on one day', () => {
    const series = computeDailyVolume(
      [
        session('2026-09-22', 'completed', [set(5, 100)]),
        session('2026-09-22', 'completed', [set(2, 50)]),
        session('2026-09-23', 'planned', [set(5, 100)]),
      ],
      3,
    )
    expect(series.map((d) => d.volume)).toEqual([0, 600, 0])
  })

  it('drops sessions outside the window', () => {
    const series = computeDailyVolume([session('2026-08-01', 'completed', [set(5, 100)])], 7)
    expect(series.every((d) => d.volume === 0)).toBe(true)
  })
})

describe('most / least active day', () => {
  const series = [
    { date: '2026-09-21', volume: 0 },
    { date: '2026-09-22', volume: 300 },
    { date: '2026-09-23', volume: 100 },
  ]

  it('compares only days that had a workout, ignoring rest days', () => {
    expect(findMostActiveDay(series)?.date).toBe('2026-09-22')
    expect(findLeastActiveDay(series)?.date).toBe('2026-09-23')
  })

  it('return null when nothing was logged', () => {
    expect(findMostActiveDay([{ date: '2026-09-23', volume: 0 }])).toBeNull()
    expect(findLeastActiveDay([])).toBeNull()
  })
})

describe('filterByRange', () => {
  const items = [{ date: '2025-01-01' }, { date: '2026-07-01' }, { date: '2026-09-01' }, { date: '2026-09-20' }]

  it('keeps items within the trailing window', () => {
    expect(filterByRange(items, '30d').map((i) => i.date)).toEqual(['2026-09-01', '2026-09-20'])
    expect(filterByRange(items, '90d').map((i) => i.date)).toEqual(['2026-07-01', '2026-09-01', '2026-09-20'])
  })

  it('"all" keeps everything', () => {
    expect(filterByRange(items, 'all')).toHaveLength(4)
  })
})
