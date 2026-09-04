import { useMemo } from 'react'
import type { WorkoutSession } from '../types'
import { computeMuscleVolume, normalizeVolumes } from '../utils/muscleVolume'

export function useMuscleVolume(sessions: WorkoutSession[], startDateISO?: string, endDateISO?: string) {
  return useMemo(() => {
    const raw = computeMuscleVolume(sessions, startDateISO, endDateISO)
    const normalized = normalizeVolumes(raw)
    return { raw, normalized }
  }, [sessions, startDateISO, endDateISO])
}
