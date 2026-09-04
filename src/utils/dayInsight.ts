import { EXERCISES_BY_ID } from '../data/exercises'
import { MUSCLE_LABELS } from '../data/muscles'
import type { Exercise, ExerciseCategory, WorkoutSession } from '../types'

export interface DayExerciseSummary {
  name: string
  category: ExerciseCategory
  muscles: string[]
}

/** Distinct exercises across all of a day's sessions, in the shape the day-insight function expects. */
export function buildDaySummary(sessions: WorkoutSession[]): DayExerciseSummary[] {
  const exerciseIds = new Set<string>()
  for (const session of sessions) {
    for (const entry of session.entries) {
      exerciseIds.add(entry.exerciseId)
    }
  }

  return Array.from(exerciseIds)
    .map((id) => EXERCISES_BY_ID[id])
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .map((exercise) => ({
      name: exercise.name,
      category: exercise.category,
      muscles: Array.from(new Set(exercise.muscles.map((m) => MUSCLE_LABELS[m.group]))),
    }))
}

/**
 * Deterministic fingerprint of which sessions/exercises make up a day, used to
 * detect whether a cached insight is stale. Deliberately ignores reps/weight/RPE
 * (tweaking a number doesn't change the "coverage" judgment), only session
 * identity/status and which exercises are present.
 */
export function fingerprintSessions(sessions: WorkoutSession[]): string {
  return sessions
    .map((session) => {
      const exerciseIds = Array.from(new Set(session.entries.map((e) => e.exerciseId))).sort()
      return `${session.id}:${session.status}:${exerciseIds.join(',')}`
    })
    .sort()
    .join('|')
}
