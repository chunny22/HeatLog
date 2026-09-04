import { EXERCISES_BY_ID } from '../data/exercises'
import { ALL_MUSCLES } from '../data/muscles'
import type { MuscleGroup, WorkoutSession } from '../types'

const SECONDARY_WEIGHT = 0.5

function setVolume(reps: number, weight: number): number {
  return reps * (weight > 0 ? weight : 1)
}

export function computeMuscleVolume(
  sessions: WorkoutSession[],
  startDateISO?: string,
  endDateISO?: string,
): Record<MuscleGroup, number> {
  const volumes = Object.fromEntries(ALL_MUSCLES.map((m) => [m, 0])) as Record<MuscleGroup, number>

  for (const session of sessions) {
    if (session.status !== 'completed') continue
    if (startDateISO && session.date < startDateISO) continue
    if (endDateISO && session.date > endDateISO) continue

    for (const entry of session.entries) {
      const exercise = EXERCISES_BY_ID[entry.exerciseId]
      if (!exercise) continue

      const entryVolume = entry.sets.reduce((sum, set) => sum + setVolume(set.reps, set.weight), 0)

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
