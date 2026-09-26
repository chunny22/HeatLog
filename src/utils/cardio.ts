import { EXERCISES_BY_ID } from '../data/exercises'
import type { CardioInterval, CardioLog, CardioTracking, DistanceUnit, Exercise, WeightUnit, WorkoutEntry, WorkoutSession } from '../types'

export const CARDIO_TRACKING: Record<string, CardioTracking> = {
  'treadmill-run': 'distance',
  cycling: 'distance',
  'rowing-machine': 'distance',
  'stair-climber': 'steps',
  'jump-rope': 'jumps',
  elliptical: 'distance',
  burpees: 'reps',
  'mountain-climbers': 'reps',
}

export const COUNT_LABELS = { steps: 'Steps', jumps: 'Jumps', reps: 'Reps' }

export function isCardioEntry(entry: WorkoutEntry, exercise = EXERCISES_BY_ID[entry.exerciseId]): boolean {
  return entry.cardio !== undefined || exercise?.category === 'cardio'
}

export function newCardioLog(exerciseId: string, unit: WeightUnit): CardioLog {
  const tracking = CARDIO_TRACKING[exerciseId] ?? 'distance'
  return {
    tracking,
    intervals: [{ durationMinutes: 0, ...(tracking === 'distance'
      ? { distanceUnit: exerciseId === 'rowing-machine' ? 'm' : unit === 'kg' ? 'km' : 'mi' }
      : {}) }],
  }
}

/** Copy a round's measurements, never its effort rating or object reference. */
export function copyCardioInterval({ intensity: _intensity, ...measurements }: CardioInterval): CardioInterval {
  return { ...measurements }
}

const positive = (value: number | undefined) => typeof value === 'number' && Number.isFinite(value) && value > 0

export function validateCardio(log: CardioLog): string | null {
  if (log.intervals.length === 0) return 'Add at least one cardio interval.'
  for (const interval of log.intervals) {
    const values = [interval.durationMinutes, interval.distance, interval.count].filter((v) => v !== undefined)
    if (values.some((v) => !Number.isFinite(v) || v < 0)) return 'Use valid, non-negative cardio values.'
    if (log.tracking === 'distance' && !positive(interval.durationMinutes)) return 'Enter a duration for each cardio interval.'
    if (log.tracking !== 'distance' && !positive(interval.durationMinutes) && !positive(interval.count)) {
      return `Enter a duration or ${COUNT_LABELS[log.tracking].toLowerCase()} for each interval.`
    }
    if (interval.count !== undefined && !Number.isInteger(interval.count)) return 'Use whole numbers for steps, jumps, and reps.'
    if (interval.intensity !== undefined && (!Number.isInteger(interval.intensity) || interval.intensity < 1 || interval.intensity > 10)) return 'Use an RPE from 1 to 10.'
    if (positive(interval.distance) && !['km', 'mi', 'm'].includes(interval.distanceUnit ?? '')) return 'Choose a distance unit.'
  }
  return null
}

export function validateCardioEntries(entries: WorkoutEntry[], exercises: Record<string, Exercise>): string | null {
  for (const entry of entries) {
    if (!entry.cardio) continue
    const error = validateCardio(entry.cardio)
    if (error) return `${exercises[entry.exerciseId]?.name ?? 'Cardio'}: ${error}`
  }
  return null
}

export function formatCardioInterval(interval: CardioInterval, tracking: CardioTracking): string {
  const parts: string[] = []
  if (positive(interval.durationMinutes)) parts.push(`${interval.durationMinutes} min`)
  if (tracking === 'distance' && positive(interval.distance)) parts.push(`${interval.distance} ${interval.distanceUnit ?? 'km'}`)
  if (tracking !== 'distance' && positive(interval.count)) parts.push(`${interval.count} ${COUNT_LABELS[tracking].toLowerCase()}`)
  if (positive(interval.intensity)) parts.push(`RPE ${interval.intensity}`)
  return parts.join(' · ') || 'Not recorded'
}

export function distanceInKm(value: number, unit: DistanceUnit): number {
  return unit === 'mi' ? value * 1.609344 : unit === 'm' ? value / 1000 : value
}

export function findLastCardio(sessions: WorkoutSession[], exerciseId: string, onOrBefore: string) {
  const latest = sessions.filter((s) => s.status === 'completed' && s.date <= onOrBefore)
    .sort((a, b) => b.date.localeCompare(a.date))
  for (const session of latest) {
    const cardio = session.entries.find((e) => e.exerciseId === exerciseId && e.cardio?.intervals.length)?.cardio
    if (cardio) return { date: session.date, cardio }
  }
  return null
}

export function cardioTotals(sessions: WorkoutSession[]) {
  const totals = { minutes: 0, distanceKm: 0, steps: 0, jumps: 0, reps: 0, workouts: 0 }
  for (const session of sessions) {
    if (session.status !== 'completed') continue
    let hasCardio = false
    for (const entry of session.entries) {
      if (!entry.cardio) continue
      for (const interval of entry.cardio.intervals) {
        if (positive(interval.durationMinutes)) { totals.minutes += interval.durationMinutes; hasCardio = true }
        if (entry.cardio.tracking === 'distance' && positive(interval.distance)) {
          totals.distanceKm += distanceInKm(interval.distance!, interval.distanceUnit ?? 'km')
          hasCardio = true
        }
        if (entry.cardio.tracking !== 'distance' && positive(interval.count)) {
          totals[entry.cardio.tracking] += interval.count!
          hasCardio = true
        }
      }
    }
    if (hasCardio) totals.workouts++
  }
  return totals
}
