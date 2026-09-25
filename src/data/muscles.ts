import type { MuscleGroup, MuscleTarget, StoredMuscleTarget } from '../types'

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  upper_chest: 'Upper Chest',
  mid_chest: 'Mid Chest',
  lower_chest: 'Lower Chest',
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
  'upper_chest',
  'mid_chest',
  'lower_chest',
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

/** Preserve whole-chest coverage in saved exercises without rewriting their data. */
export function expandLegacyChest(muscles: StoredMuscleTarget[]): MuscleTarget[] {
  const targets = new Map<MuscleGroup, MuscleTarget['role']>()
  for (const { group, role } of muscles) {
    if (group === 'chest') {
      // Explicit regional choices win if a record contains both formats.
      if (!targets.has('upper_chest')) targets.set('upper_chest', role)
      if (!targets.has('mid_chest')) targets.set('mid_chest', role)
      if (!targets.has('lower_chest')) targets.set('lower_chest', role)
    } else {
      targets.set(group, role)
    }
  }
  return Array.from(targets, ([group, role]) => ({ group, role }))
}
