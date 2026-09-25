export type MuscleGroup =
  | 'upper_chest'
  | 'mid_chest'
  | 'lower_chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'lats'
  | 'traps'
  | 'upper_back'
  | 'lower_back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'

export type ExerciseCategory = 'push' | 'pull' | 'legs' | 'core' | 'cardio'

export interface MuscleTarget {
  group: MuscleGroup
  role: 'primary' | 'secondary'
}

/** Older custom exercises stored one undivided chest target. */
export interface StoredMuscleTarget extends Omit<MuscleTarget, 'group'> {
  group: MuscleGroup | 'chest'
}

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  muscles: MuscleTarget[]
}

export type WeightUnit = 'lb' | 'kg'

export interface SetEntry {
  reps: number
  weight: number
  unit: WeightUnit
  /** RPE 1-10. Absent for planned sets; filled in when the workout is marked done. */
  intensity?: number
}

export interface WorkoutEntry {
  exerciseId: string
  sets: SetEntry[]
}

export type WorkoutStatus = 'planned' | 'completed'

export interface WorkoutSession {
  id: string
  date: string
  notes?: string
  entries: WorkoutEntry[]
  status: WorkoutStatus
}

export type HeightUnit = 'in' | 'cm'

export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'lean_tone' | 'bulk_strength' | 'general_fitness'

export interface Profile {
  id: string
  firstName: string
  lastName: string
  weight: number
  weightUnit: WeightUnit
  /** Default unit for new sets and the Progress charts (separate from the body-weight unit). */
  unitPreference: WeightUnit
  height: number
  heightUnit: HeightUnit
  goals: FitnessGoal[]
}

export interface SignUpProfileInput {
  firstName: string
  lastName: string
  weight: number
  weightUnit: WeightUnit
  height: number
  heightUnit: HeightUnit
  goals: FitnessGoal[]
}
