import type { FitnessGoal } from '../types'

export interface GoalOption {
  id: FitnessGoal
  label: string
  description: string
}

export const GOALS: GoalOption[] = [
  { id: 'lose_weight', label: 'Lose Weight', description: 'Fat loss, calorie deficit focus' },
  { id: 'build_muscle', label: 'Build Muscle', description: 'Hypertrophy, balanced volume across muscle groups' },
  { id: 'lean_tone', label: 'Get Lean & Toned', description: 'Recomposition, mix of resistance + cardio' },
  { id: 'bulk_strength', label: 'Bulk / Gain Strength', description: 'Heavy compounds, progressive overload' },
  { id: 'general_fitness', label: 'General Fitness', description: 'Balanced activity, no aggressive specialization' },
]

export const GOALS_BY_ID: Record<FitnessGoal, GoalOption> = Object.fromEntries(
  GOALS.map((goal) => [goal.id, goal]),
) as Record<FitnessGoal, GoalOption>
