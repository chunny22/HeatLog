import type { Exercise, ExerciseCategory, MuscleGroup } from '../types'

export type MuscleRole = 'primary' | 'secondary'
export type MuscleSelection = Partial<Record<MuscleGroup, MuscleRole>>

export const NAME_MAX = 60

/** Muscles grouped the way people think about them, for the picker in the form. */
export const MUSCLE_SECTIONS: { title: string; muscles: MuscleGroup[] }[] = [
  {
    title: 'Upper body',
    muscles: ['upper_chest', 'mid_chest', 'lower_chest', 'front_delts', 'side_delts', 'rear_delts', 'lats', 'traps', 'upper_back', 'biceps', 'triceps', 'forearms'],
  },
  { title: 'Core', muscles: ['abs', 'obliques', 'lower_back'] },
  { title: 'Lower body', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
]

/** Tapping a muscle toggles it: off -> selected -> off. (Any older "helps" muscle also clears on tap.) */
export function nextMuscleRole(current: MuscleRole | undefined): MuscleRole | undefined {
  return current === undefined ? 'primary' : undefined
}

export function selectionToMuscles(selection: MuscleSelection): Exercise['muscles'] {
  const entries = Object.entries(selection) as [MuscleGroup, MuscleRole][]
  const muscles = entries.map(([group, role]) => ({ group, role }))
  // Main muscles first, so the list reads the way the built-in exercises do.
  return [...muscles.filter((m) => m.role === 'primary'), ...muscles.filter((m) => m.role === 'secondary')]
}

export function musclesToSelection(muscles: Exercise['muscles']): MuscleSelection {
  return Object.fromEntries(muscles.map((m) => [m.group, m.role])) as MuscleSelection
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

const sameName = (a: string, b: string) => normalizeName(a).toLowerCase() === normalizeName(b).toLowerCase()

/**
 * Returns a message for the first problem with a new/edited exercise, or null
 * if it's fine. `takenNames` are the names it must not duplicate (the built-in
 * list plus the user's other active exercises).
 */
export function validateCustomExercise(
  input: { name: string; category: ExerciseCategory; muscles: Exercise['muscles'] },
  takenNames: string[],
): string | null {
  const name = normalizeName(input.name)
  if (!name) return 'Give the exercise a name.'
  if (name.length > NAME_MAX) return `Keep the name under ${NAME_MAX} characters.`
  if (takenNames.some((taken) => sameName(taken, name))) return 'That exercise is already in the list.'
  // The heatmap and AI coach need to know what was worked; cardio may skip it.
  if (input.category !== 'cardio' && !input.muscles.some((m) => m.role === 'primary')) {
    return 'Pick at least one muscle.'
  }
  return null
}

const CUSTOM_PREFIX = 'custom-'

/** Custom exercises get a prefixed id so they can never collide with built-in slugs. */
export const toCustomExerciseId = (rowId: string) => `${CUSTOM_PREFIX}${rowId}`
export const isCustomExerciseId = (id: string) => id.startsWith(CUSTOM_PREFIX)
export const fromCustomExerciseId = (id: string) => id.slice(CUSTOM_PREFIX.length)
