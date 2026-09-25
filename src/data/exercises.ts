import type { Exercise } from '../types'

const primary = (group: Exercise['muscles'][number]['group']) => ({ group, role: 'primary' as const })
const secondary = (group: Exercise['muscles'][number]['group']) => ({ group, role: 'secondary' as const })

export const EXERCISES: Exercise[] = [
  // Push
  // Chest regions use the app's simplified primary/secondary weighting, not
  // measured activation percentages. Flat presses cover all three; incline favors upper.
  { id: 'barbell-bench-press', name: 'Barbell Bench Press', category: 'push', muscles: [primary('upper_chest'), primary('mid_chest'), primary('lower_chest'), secondary('front_delts'), secondary('triceps')] },
  { id: 'incline-bench-press', name: 'Incline Bench Press', category: 'push', muscles: [primary('upper_chest'), secondary('mid_chest'), secondary('lower_chest'), primary('front_delts'), secondary('triceps')] },
  { id: 'dumbbell-bench-press', name: 'Dumbbell Bench Press', category: 'push', muscles: [primary('upper_chest'), primary('mid_chest'), primary('lower_chest'), secondary('front_delts'), secondary('triceps')] },
  { id: 'incline-dumbbell-press', name: 'Incline Dumbbell Press', category: 'push', muscles: [primary('upper_chest'), secondary('mid_chest'), secondary('lower_chest'), primary('front_delts'), secondary('triceps')] },
  { id: 'push-up', name: 'Push-Up', category: 'push', muscles: [primary('upper_chest'), primary('mid_chest'), primary('lower_chest'), secondary('front_delts'), secondary('triceps'), secondary('abs')] },
  { id: 'dips', name: 'Dips', category: 'push', muscles: [primary('upper_chest'), primary('mid_chest'), primary('lower_chest'), primary('triceps'), secondary('front_delts')] },
  { id: 'cable-fly', name: 'Cable Fly', category: 'push', muscles: [primary('upper_chest'), primary('mid_chest'), primary('lower_chest')] },
  { id: 'pec-deck', name: 'Pec Deck', category: 'push', muscles: [primary('upper_chest'), primary('mid_chest'), primary('lower_chest')] },
  { id: 'overhead-press', name: 'Overhead Press', category: 'push', muscles: [primary('front_delts'), secondary('side_delts'), secondary('triceps')] },
  { id: 'dumbbell-shoulder-press', name: 'Dumbbell Shoulder Press', category: 'push', muscles: [primary('front_delts'), secondary('side_delts'), secondary('triceps')] },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'push', muscles: [primary('side_delts')] },
  { id: 'front-raise', name: 'Front Raise', category: 'push', muscles: [primary('front_delts')] },
  { id: 'arnold-press', name: 'Arnold Press', category: 'push', muscles: [primary('front_delts'), primary('side_delts'), secondary('triceps')] },
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'push', muscles: [primary('triceps')] },
  { id: 'skull-crushers', name: 'Skull Crushers', category: 'push', muscles: [primary('triceps')] },
  { id: 'overhead-tricep-extension', name: 'Overhead Tricep Extension', category: 'push', muscles: [primary('triceps')] },
  { id: 'close-grip-bench-press', name: 'Close-Grip Bench Press', category: 'push', muscles: [primary('triceps'), secondary('upper_chest'), secondary('mid_chest'), secondary('lower_chest')] },

  // Pull
  { id: 'deadlift', name: 'Deadlift', category: 'pull', muscles: [primary('lower_back'), primary('hamstrings'), primary('glutes'), secondary('traps'), secondary('forearms')] },
  { id: 'pull-up', name: 'Pull-Up', category: 'pull', muscles: [primary('lats'), secondary('biceps'), secondary('upper_back')] },
  { id: 'chin-up', name: 'Chin-Up', category: 'pull', muscles: [primary('lats'), primary('biceps'), secondary('upper_back')] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'pull', muscles: [primary('lats'), secondary('biceps'), secondary('upper_back')] },
  { id: 'barbell-row', name: 'Barbell Row', category: 'pull', muscles: [primary('upper_back'), primary('lats'), secondary('biceps'), secondary('lower_back')] },
  { id: 'dumbbell-row', name: 'Dumbbell Row', category: 'pull', muscles: [primary('upper_back'), primary('lats'), secondary('biceps')] },
  { id: 'seated-cable-row', name: 'Seated Cable Row', category: 'pull', muscles: [primary('upper_back'), primary('lats'), secondary('biceps')] },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'pull', muscles: [primary('upper_back'), primary('lats'), secondary('biceps')] },
  { id: 'face-pull', name: 'Face Pull', category: 'pull', muscles: [primary('rear_delts'), secondary('upper_back')] },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'pull', muscles: [primary('rear_delts')] },
  { id: 'shrugs', name: 'Shrugs', category: 'pull', muscles: [primary('traps')] },
  { id: 'barbell-curl', name: 'Barbell Curl', category: 'pull', muscles: [primary('biceps'), secondary('forearms')] },
  { id: 'dumbbell-curl', name: 'Dumbbell Curl', category: 'pull', muscles: [primary('biceps'), secondary('forearms')] },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'pull', muscles: [primary('biceps'), primary('forearms')] },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'pull', muscles: [primary('biceps')] },
  { id: 'cable-curl', name: 'Cable Curl', category: 'pull', muscles: [primary('biceps')] },
  { id: 'wrist-curl', name: 'Wrist Curl', category: 'pull', muscles: [primary('forearms')] },
  { id: 'back-extension', name: 'Back Extension', category: 'pull', muscles: [primary('lower_back'), secondary('glutes'), secondary('hamstrings')] },

  // Legs
  { id: 'barbell-back-squat', name: 'Barbell Back Squat', category: 'legs', muscles: [primary('quads'), primary('glutes'), secondary('hamstrings'), secondary('lower_back')] },
  { id: 'front-squat', name: 'Front Squat', category: 'legs', muscles: [primary('quads'), secondary('glutes'), secondary('abs')] },
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'legs', muscles: [primary('quads'), secondary('glutes')] },
  { id: 'leg-press', name: 'Leg Press', category: 'legs', muscles: [primary('quads'), primary('glutes'), secondary('hamstrings')] },
  { id: 'walking-lunge', name: 'Walking Lunge', category: 'legs', muscles: [primary('quads'), primary('glutes'), secondary('hamstrings')] },
  { id: 'bulgarian-split-squat', name: 'Bulgarian Split Squat', category: 'legs', muscles: [primary('quads'), primary('glutes'), secondary('hamstrings')] },
  { id: 'leg-extension', name: 'Leg Extension', category: 'legs', muscles: [primary('quads')] },
  { id: 'leg-curl', name: 'Leg Curl', category: 'legs', muscles: [primary('hamstrings')] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', muscles: [primary('hamstrings'), primary('glutes'), secondary('lower_back')] },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', muscles: [primary('glutes'), secondary('hamstrings')] },
  { id: 'glute-bridge', name: 'Glute Bridge', category: 'legs', muscles: [primary('glutes'), secondary('hamstrings')] },
  { id: 'cable-kickback', name: 'Cable Kickback', category: 'legs', muscles: [primary('glutes')] },
  { id: 'standing-calf-raise', name: 'Standing Calf Raise', category: 'legs', muscles: [primary('calves')] },
  { id: 'seated-calf-raise', name: 'Seated Calf Raise', category: 'legs', muscles: [primary('calves')] },
  { id: 'hip-abduction-machine', name: 'Hip Abduction Machine', category: 'legs', muscles: [primary('glutes')] },

  // Core
  { id: 'plank', name: 'Plank', category: 'core', muscles: [primary('abs'), secondary('obliques')] },
  { id: 'crunch', name: 'Crunch', category: 'core', muscles: [primary('abs')] },
  { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'core', muscles: [primary('abs'), secondary('obliques')] },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'core', muscles: [primary('abs')] },
  { id: 'russian-twist', name: 'Russian Twist', category: 'core', muscles: [primary('obliques'), secondary('abs')] },
  { id: 'side-plank', name: 'Side Plank', category: 'core', muscles: [primary('obliques'), secondary('abs')] },
  { id: 'ab-wheel-rollout', name: 'Ab Wheel Rollout', category: 'core', muscles: [primary('abs'), secondary('obliques')] },
  { id: 'sit-up', name: 'Sit-Up', category: 'core', muscles: [primary('abs')] },
  { id: 'woodchopper', name: 'Cable Woodchopper', category: 'core', muscles: [primary('obliques'), secondary('abs')] },

  // Cardio
  { id: 'treadmill-run', name: 'Treadmill Run', category: 'cardio', muscles: [primary('quads'), primary('hamstrings'), secondary('calves')] },
  { id: 'cycling', name: 'Cycling', category: 'cardio', muscles: [primary('quads'), secondary('hamstrings'), secondary('calves')] },
  { id: 'rowing-machine', name: 'Rowing Machine', category: 'cardio', muscles: [primary('upper_back'), primary('quads'), secondary('biceps'), secondary('hamstrings')] },
  { id: 'stair-climber', name: 'Stair Climber', category: 'cardio', muscles: [primary('quads'), primary('glutes'), secondary('calves')] },
  { id: 'jump-rope', name: 'Jump Rope', category: 'cardio', muscles: [primary('calves'), secondary('quads')] },
  { id: 'elliptical', name: 'Elliptical', category: 'cardio', muscles: [primary('quads'), primary('glutes'), secondary('hamstrings')] },
  { id: 'burpees', name: 'Burpees', category: 'cardio', muscles: [primary('quads'), primary('upper_chest'), primary('mid_chest'), primary('lower_chest'), secondary('abs'), secondary('front_delts')] },
  { id: 'mountain-climbers', name: 'Mountain Climbers', category: 'cardio', muscles: [primary('abs'), secondary('quads'), secondary('front_delts')] },
]

export const EXERCISES_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((exercise) => [exercise.id, exercise]),
)
