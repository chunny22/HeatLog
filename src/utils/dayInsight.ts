import { EXERCISES_BY_ID } from '../data/exercises'
import { MUSCLE_LABELS } from '../data/muscles'
import type { Exercise, ExerciseCategory, WorkoutSession } from '../types'

export interface DayExerciseSummary {
  name: string
  category: ExerciseCategory
  muscles: string[]
  /** Average RPE (1-10) across this exercise's logged sets that day, or null if none were rated. */
  avgRpe: number | null
}

/** Distinct exercises across all of a day's sessions, in the shape the day-insight function expects. */
const avg = (values: number[]) => Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10

export function buildDaySummary(
  sessions: WorkoutSession[],
  exercisesById: Record<string, Exercise> = EXERCISES_BY_ID,
): DayExerciseSummary[] {
  const exerciseIds = new Set<string>()
  const rpes = new Map<string, number[]>()
  for (const session of sessions) {
    for (const entry of session.entries) {
      exerciseIds.add(entry.exerciseId)
      for (const set of entry.cardio?.intervals ?? entry.sets) {
        if (set.intensity && set.intensity > 0) {
          rpes.set(entry.exerciseId, [...(rpes.get(entry.exerciseId) ?? []), set.intensity])
        }
      }
    }
  }

  return Array.from(exerciseIds)
    .map((id) => exercisesById[id])
    .filter((exercise): exercise is Exercise => Boolean(exercise))
    .map((exercise) => {
      const ratings = rpes.get(exercise.id)
      return {
        name: exercise.name,
        category: exercise.category,
        muscles: Array.from(new Set(exercise.muscles.map((m) => MUSCLE_LABELS[m.group]))),
        avgRpe: ratings ? avg(ratings) : null,
      }
    })
}

/**
 * Deterministic fingerprint of which sessions/exercises make up a day, used to
 * detect whether a cached insight is stale. Deliberately ignores reps/weight/RPE
 * (tweaking a number doesn't change the "coverage" judgment), only session
 * identity/status and the definitions of the exercises present. RPE is only ever entered when
 * a session is completed, which already changes its status, so the coach's
 * comments on effort stay current without hashing the ratings.
 */
export function fingerprintSessions(
  sessions: WorkoutSession[],
  exercisesById: Record<string, Exercise> = EXERCISES_BY_ID,
): string {
  return sessions
    .map((session) => {
      const exerciseIds = Array.from(new Set(session.entries.map((e) => e.exerciseId))).sort()
      const exercises = exerciseIds.map((id) => {
        const exercise = exercisesById[id]
        if (!exercise) return [id]
        const muscles = exercise.muscles.map(({ group, role }) => `${group}:${role}`).sort()
        return [id, exercise.name, exercise.category, muscles]
      })
      return `${session.id}:${session.status}:${JSON.stringify(exercises)}`
    })
    .sort()
    .join('|')
}
