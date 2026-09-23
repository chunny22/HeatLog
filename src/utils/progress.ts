import type { SetEntry, WeightUnit, WorkoutSession } from '../types'

const LB_PER_KG = 2.20462

export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value
  return from === 'kg' ? value * LB_PER_KG : value / LB_PER_KG
}

/** Epley estimate of a one-rep max. A single rep is already a max. */
export function estimateOneRepMax(weight: number, reps: number): number {
  return reps <= 1 ? weight : weight * (1 + reps / 30)
}

const isWorkingSet = (set: SetEntry) => set.reps > 0 && set.weight > 0

/** The sets logged for an exercise in its most recent completed session on or before `onOrBefore`. */
export function findLastPerformance(
  sessions: WorkoutSession[],
  exerciseId: string,
  onOrBefore: string,
): { date: string; sets: SetEntry[] } | null {
  let best: { date: string; sets: SetEntry[] } | null = null

  for (const session of sessions) {
    if (session.status !== 'completed' || session.date > onOrBefore) continue
    if (best && session.date <= best.date) continue

    const sets = session.entries
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets)
      .filter((s) => s.reps > 0)
    if (sets.length > 0) best = { date: session.date, sets }
  }

  return best
}

export interface StrengthPoint {
  date: string
  oneRepMax: number
  bestSet: { reps: number; weight: number }
  heaviestSet: { reps: number; weight: number }
}

/** Exercises with at least one completed weighted set, most recently trained first. */
export function exercisesWithHistory(sessions: WorkoutSession[]): string[] {
  const lastSeen = new Map<string, string>()
  for (const session of sessions) {
    if (session.status !== 'completed') continue
    for (const entry of session.entries) {
      if (!entry.sets.some(isWorkingSet)) continue
      const prev = lastSeen.get(entry.exerciseId)
      if (!prev || session.date > prev) lastSeen.set(entry.exerciseId, session.date)
    }
  }
  return [...lastSeen.entries()].sort((a, b) => (a[1] < b[1] ? 1 : -1)).map(([id]) => id)
}

/** Best estimated one-rep max per session for one exercise, oldest first, in `unit`. */
export function strengthSeries(sessions: WorkoutSession[], exerciseId: string, unit: WeightUnit): StrengthPoint[] {
  const byDate = new Map<string, StrengthPoint>()

  for (const session of sessions) {
    if (session.status !== 'completed') continue
    for (const entry of session.entries) {
      if (entry.exerciseId !== exerciseId) continue
      for (const set of entry.sets) {
        if (!isWorkingSet(set)) continue
        const weight = convertWeight(set.weight, set.unit, unit)
        const oneRepMax = estimateOneRepMax(weight, set.reps)
        const current = { reps: set.reps, weight }
        const existing = byDate.get(session.date)
        if (!existing) {
          byDate.set(session.date, { date: session.date, oneRepMax, bestSet: current, heaviestSet: current })
          continue
        }
        if (oneRepMax > existing.oneRepMax) {
          existing.oneRepMax = oneRepMax
          existing.bestSet = current
        }
        if (weight > existing.heaviestSet.weight) existing.heaviestSet = current
      }
    }
  }

  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1))
}
