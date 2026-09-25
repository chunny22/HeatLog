import { useMemo } from 'react'
import type { WorkoutSession } from '../types'
import { useExercises } from '../exercises/ExerciseContext'
import { computeMuscleVolume, normalizeVolumes } from '../utils/muscleVolume'

export function useMuscleVolume(sessions: WorkoutSession[], startDateISO?: string, endDateISO?: string) {
  const { exercisesById } = useExercises()
  return useMemo(() => {
    const raw = computeMuscleVolume(sessions, startDateISO, endDateISO, exercisesById)
    const normalized = normalizeVolumes(raw)
    return { raw, normalized }
  }, [sessions, startDateISO, endDateISO, exercisesById])
}
