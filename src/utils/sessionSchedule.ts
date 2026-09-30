import type { WorkoutSession } from '../types'
import { toISODate } from './date'

export function validWorkoutDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date.startsWith('0000')) return false
  const parsed = new Date(`${date}T12:00:00`)
  return Number.isFinite(parsed.getTime()) && toISODate(parsed) === date
}

export function nextWorkoutDate(date: string): string {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + 1)
  return toISODate(next)
}

/** Repeat the prescription, without copying identity or recorded effort. */
export function duplicateAsPlan(session: WorkoutSession, date: string): Omit<WorkoutSession, 'id'> {
  return {
    date,
    status: 'planned',
    notes: session.notes,
    entries: session.entries.map((entry) => ({
      ...entry,
      sets: entry.sets.map(({ intensity: _intensity, ...set }) => ({ ...set })),
      ...(entry.cardio ? {
        cardio: {
          ...entry.cardio,
          intervals: entry.cardio.intervals.map(({ intensity: _intensity, ...interval }) => ({ ...interval })),
        },
      } : {}),
    })),
  }
}
