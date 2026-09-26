import { EXERCISES_BY_ID } from '../data/exercises'
import { ALL_MUSCLES } from '../data/muscles'
import type { Exercise, MuscleGroup, WorkoutSession } from '../types'
import { isCardioEntry } from './cardio'

const SECONDARY_WEIGHT = 0.5

export function setVolume(reps: number, weight: number): number {
  return reps * (weight > 0 ? weight : 1)
}

/**
 * How much harder or easier than "normal" a set was, from its RPE (1-10).
 * RPE 8 is the baseline (x1), each point above adds 10% and each below removes
 * 10%, so RPE 10 counts x1.2 and RPE 6 counts x0.8. A set with no RPE (planned,
 * or left blank) is neutral, so workouts logged without RPE colour as before.
 */
export function rpeFactor(rpe: number | undefined): number {
  if (!rpe || !Number.isFinite(rpe) || rpe < 1) return 1
  const clamped = Math.min(10, Math.max(1, rpe))
  return 1 + (clamped - 8) * 0.1
}

export function computeMuscleVolume(
  sessions: WorkoutSession[],
  startDateISO?: string,
  endDateISO?: string,
  // Built-in exercises by default; pass the user's custom ones too to include them.
  exercisesById: Record<string, Exercise> = EXERCISES_BY_ID,
): Record<MuscleGroup, number> {
  const volumes = Object.fromEntries(ALL_MUSCLES.map((m) => [m, 0])) as Record<MuscleGroup, number>

  for (const session of sessions) {
    if (session.status !== 'completed') continue
    if (startDateISO && session.date < startDateISO) continue
    if (endDateISO && session.date > endDateISO) continue

    for (const entry of session.entries) {
      const exercise = exercisesById[entry.exerciseId]
      if (!exercise || isCardioEntry(entry, exercise)) continue

      const entryVolume = entry.sets.reduce(
        (sum, set) => sum + setVolume(set.reps, set.weight) * rpeFactor(set.intensity),
        0,
      )

      for (const { group, role } of exercise.muscles) {
        volumes[group] += entryVolume * (role === 'primary' ? 1 : SECONDARY_WEIGHT)
      }
    }
  }

  return volumes
}

/** Normalizes raw volumes to a 0-1 scale relative to the largest value. */
export function normalizeVolumes(volumes: Record<MuscleGroup, number>): Record<MuscleGroup, number> {
  const max = Math.max(...Object.values(volumes), 0)
  if (max === 0) return volumes

  return Object.fromEntries(
    Object.entries(volumes).map(([group, value]) => [group, value / max]),
  ) as Record<MuscleGroup, number>
}
