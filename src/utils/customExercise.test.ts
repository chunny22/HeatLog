import { describe, expect, it } from 'vitest'
import { ALL_MUSCLES } from '../data/muscles'
import {
  fromCustomExerciseId,
  isCustomExerciseId,
  MUSCLE_SECTIONS,
  musclesToSelection,
  nextMuscleRole,
  normalizeName,
  selectionToMuscles,
  toCustomExerciseId,
  validateCustomExercise,
} from './customExercise'

const legs = (muscles: Parameters<typeof validateCustomExercise>[0]['muscles']) => ({
  name: 'Zercher squat',
  category: 'legs' as const,
  muscles,
})

describe('nextMuscleRole', () => {
  it('toggles off -> selected -> off', () => {
    expect(nextMuscleRole(undefined)).toBe('primary')
    expect(nextMuscleRole('primary')).toBeUndefined()
  })

  it('clears an older "helps" muscle in one tap too', () => {
    expect(nextMuscleRole('secondary')).toBeUndefined()
  })
})

describe('selection <-> muscles', () => {
  it('lists main muscles first', () => {
    const muscles = selectionToMuscles({ hamstrings: 'secondary', quads: 'primary', glutes: 'primary' })
    expect(muscles.map((m) => m.role)).toEqual(['primary', 'primary', 'secondary'])
    expect(muscles.at(-1)).toEqual({ group: 'hamstrings', role: 'secondary' })
  })

  it('round-trips', () => {
    const selection = { quads: 'primary', abs: 'secondary' } as const
    expect(musclesToSelection(selectionToMuscles(selection))).toEqual(selection)
  })

  it('leaves out muscles that are switched off', () => {
    expect(selectionToMuscles({ quads: 'primary', abs: undefined })).toEqual([{ group: 'quads', role: 'primary' }])
  })
})

describe('MUSCLE_SECTIONS', () => {
  it('offers every muscle exactly once', () => {
    const listed = MUSCLE_SECTIONS.flatMap((s) => s.muscles)
    expect([...listed].sort()).toEqual([...ALL_MUSCLES].sort())
  })
})

describe('validateCustomExercise', () => {
  const ok = [{ group: 'quads' as const, role: 'primary' as const }]

  it('accepts a good exercise', () => {
    expect(validateCustomExercise(legs(ok), ['Barbell Back Squat'])).toBeNull()
  })

  it('needs a name', () => {
    expect(validateCustomExercise({ ...legs(ok), name: '   ' }, [])).toBe('Give the exercise a name.')
  })

  it('caps the name length', () => {
    expect(validateCustomExercise({ ...legs(ok), name: 'x'.repeat(61) }, [])).toMatch(/under 60/)
    expect(validateCustomExercise({ ...legs(ok), name: 'x'.repeat(60) }, [])).toBeNull()
  })

  it('refuses a duplicate name regardless of case and spacing', () => {
    expect(validateCustomExercise({ ...legs(ok), name: '  barbell   BACK squat ' }, ['Barbell Back Squat'])).toBe(
      'That exercise is already in the list.',
    )
  })

  it('needs at least one muscle (helping-only is not enough)', () => {
    expect(validateCustomExercise(legs([]), [])).toBe('Pick at least one muscle.')
    expect(validateCustomExercise(legs([{ group: 'abs', role: 'secondary' }]), [])).toBe('Pick at least one muscle.')
  })

  it('lets cardio skip muscles', () => {
    expect(validateCustomExercise({ name: 'Rowing machine', category: 'cardio', muscles: [] }, [])).toBeNull()
  })
})

describe('ids and names', () => {
  it('prefixes custom ids so they cannot collide with built-in ones', () => {
    const id = toCustomExerciseId('abc-123')
    expect(id).toBe('custom-abc-123')
    expect(isCustomExerciseId(id)).toBe(true)
    expect(isCustomExerciseId('barbell-bench-press')).toBe(false)
    expect(fromCustomExerciseId(id)).toBe('abc-123')
  })

  it('tidies whitespace in names', () => {
    expect(normalizeName('  Zercher    squat ')).toBe('Zercher squat')
  })
})
