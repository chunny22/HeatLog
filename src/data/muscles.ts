import type { MuscleGroup } from '../types'

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  front_delts: 'Front Delts',
  side_delts: 'Side Delts',
  rear_delts: 'Rear Delts',
  lats: 'Lats',
  traps: 'Traps',
  upper_back: 'Upper Back',
  lower_back: 'Lower Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
}

export const FRONT_MUSCLES: MuscleGroup[] = [
  'front_delts',
  'side_delts',
  'chest',
  'biceps',
  'forearms',
  'abs',
  'obliques',
  'quads',
]

export const BACK_MUSCLES: MuscleGroup[] = [
  'traps',
  'rear_delts',
  'upper_back',
  'lats',
  'lower_back',
  'triceps',
  'glutes',
  'hamstrings',
  'calves',
]

export const ALL_MUSCLES: MuscleGroup[] = Array.from(
  new Set([...FRONT_MUSCLES, ...BACK_MUSCLES]),
)
