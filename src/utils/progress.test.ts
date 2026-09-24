import { describe, expect, it } from 'vitest'
import type { SetEntry, WorkoutSession } from '../types'
import {
  convertWeight,
  estimateOneRepMax,
  exercisesWithHistory,
  findLastPerformance,
  strengthSeries,
} from './progress'

const s = (reps: number, weight: number, unit: SetEntry['unit'] = 'lb'): SetEntry => ({ reps, weight, unit })
const mk = (
  date: string,
  status: WorkoutSession['status'],
  sets: SetEntry[],
  exerciseId = 'bench',
): WorkoutSession => ({ id: `${date}-${exerciseId}`, date, status, entries: [{ exerciseId, sets }] })

describe('convertWeight', () => {
  it('is a no-op for the same unit', () => {
    expect(convertWeight(100, 'lb', 'lb')).toBe(100)
  })

  it('converts between kg and lb and back', () => {
    expect(convertWeight(100, 'kg', 'lb')).toBeCloseTo(220.462, 2)
    expect(convertWeight(convertWeight(80, 'kg', 'lb'), 'lb', 'kg')).toBeCloseTo(80, 6)
  })
})

describe('estimateOneRepMax', () => {
  it('treats a single rep as the max itself', () => {
    expect(estimateOneRepMax(200, 1)).toBe(200)
  })

  it('applies Epley for multiple reps', () => {
    expect(estimateOneRepMax(195, 5)).toBeCloseTo(227.5, 5)
  })
})

describe('findLastPerformance', () => {
  const sessions = [
    mk('2026-09-02', 'completed', [s(5, 185)]),
    mk('2026-09-09', 'completed', [s(6, 185)]),
    mk('2026-09-20', 'planned', [s(5, 225)]),
  ]

  it('returns the most recent completed session on or before the date', () => {
    expect(findLastPerformance(sessions, 'bench', '2026-09-30')?.date).toBe('2026-09-09')
    expect(findLastPerformance(sessions, 'bench', '2026-09-09')?.date).toBe('2026-09-09')
    expect(findLastPerformance(sessions, 'bench', '2026-09-05')?.date).toBe('2026-09-02')
  })

  it('never returns planned sessions or later dates', () => {
    expect(findLastPerformance(sessions, 'bench', '2026-09-01')).toBeNull()
  })

  it('returns null for an exercise with no history', () => {
    expect(findLastPerformance(sessions, 'squat', '2026-09-30')).toBeNull()
  })

  it('does not depend on input order', () => {
    expect(findLastPerformance([...sessions].reverse(), 'bench', '2026-09-30')?.date).toBe('2026-09-09')
  })

  it('ignores sets with no reps', () => {
    const only = [mk('2026-09-02', 'completed', [s(0, 100)])]
    expect(findLastPerformance(only, 'bench', '2026-09-30')).toBeNull()
  })
})

describe('strengthSeries', () => {
  it('keeps the best estimated set per session, oldest first', () => {
    const series = strengthSeries(
      [mk('2026-09-09', 'completed', [s(6, 185), s(1, 100, 'kg')]), mk('2026-09-02', 'completed', [s(5, 185)])],
      'bench',
      'lb',
    )
    expect(series.map((p) => p.date)).toEqual(['2026-09-02', '2026-09-09'])
    // 185 x 6 -> ~222 beats a 100 kg single (~220 lb).
    expect(series[1].oneRepMax).toBeCloseTo(222, 5)
    expect(series[1].bestSet).toEqual({ reps: 6, weight: 185 })
    // ...but the 100 kg single is the heaviest set.
    expect(series[1].heaviestSet.weight).toBeCloseTo(220.462, 2)
  })

  it('converts every set into the requested unit', () => {
    const [p] = strengthSeries([mk('2026-09-02', 'completed', [s(1, 100, 'kg')])], 'bench', 'kg')
    expect(p.oneRepMax).toBeCloseTo(100, 6)
  })

  it('skips planned sessions and zero-weight (bodyweight) sets', () => {
    const series = strengthSeries(
      [mk('2026-09-02', 'planned', [s(5, 200)]), mk('2026-09-03', 'completed', [s(10, 0)])],
      'bench',
      'lb',
    )
    expect(series).toEqual([])
  })
})

describe('exercisesWithHistory', () => {
  it('lists weighted, completed exercises most recently trained first', () => {
    const list = exercisesWithHistory([
      mk('2026-09-02', 'completed', [s(5, 100)], 'squat'),
      mk('2026-09-09', 'completed', [s(5, 100)], 'bench'),
      mk('2026-09-12', 'planned', [s(5, 100)], 'row'),
      mk('2026-09-13', 'completed', [s(10, 0)], 'pullup'),
    ])
    expect(list).toEqual(['bench', 'squat'])
  })
})
