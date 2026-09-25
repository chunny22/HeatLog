import { useState, type FormEvent } from 'react'
import { MUSCLE_LABELS } from '../../data/muscles'
import { useExercises, type CustomExerciseInput } from '../../exercises/ExerciseContext'
import type { ExerciseCategory, MuscleGroup } from '../../types'
import {
  MUSCLE_SECTIONS,
  NAME_MAX,
  musclesToSelection,
  nextMuscleRole,
  selectionToMuscles,
  validateCustomExercise,
  type MuscleSelection,
} from '../../utils/customExercise'
import { Alert } from '../Alert'
import { btnPrimaryClass, btnSecondaryClass, chipClass, fieldClass, labelClass } from '../ui'

const CATEGORIES: ExerciseCategory[] = ['push', 'pull', 'legs', 'core', 'cardio']

function muscleChipClass(selected: boolean) {
  const base = 'inline-flex h-10 items-center rounded-full px-3.5 text-[13px] transition-colors sm:h-9 '
  return selected
    ? `${base}bg-accent font-bold text-white`
    : `${base}bg-sunken font-semibold text-ink-2 hover:bg-line`
}

interface ExerciseFormProps {
  title: string
  submitLabel: string
  initial?: CustomExerciseInput
  /** The exercise being edited, so its own name isn't flagged as a duplicate. */
  excludeId?: string
  onSubmit: (input: CustomExerciseInput) => Promise<{ error: string | null }>
  onCancel: () => void
}

export function ExerciseForm({ title, submitLabel, initial, excludeId, onSubmit, onCancel }: ExerciseFormProps) {
  const { takenNames } = useExercises()
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<ExerciseCategory>(initial?.category ?? 'push')
  const [selection, setSelection] = useState<MuscleSelection>(musclesToSelection(initial?.muscles ?? []))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const input = { name, category, muscles: selectionToMuscles(selection) }
    const problem = validateCustomExercise(input, takenNames(excludeId))
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    setSaving(true)
    const result = await onSubmit(input)
    setSaving(false)
    if (result.error) setError(result.error)
  }

  const cycle = (group: MuscleGroup) =>
    setSelection((prev) => {
      const next = { ...prev }
      const role = nextMuscleRole(prev[group])
      if (role) next[group] = role
      else delete next[group]
      return next
    })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h3 className="text-base font-bold text-ink">{title}</h3>

      <label className={labelClass}>
        Name
        <input
          type="text"
          required
          maxLength={NAME_MAX}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={fieldClass}
        />
      </label>

      <div className={labelClass}>
        Category
        <div role="group" aria-label="Category" className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={`${chipClass(category === cat)} capitalize`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className={labelClass}>
          Muscles worked
          <span className="text-xs font-medium text-ink-3">
            Tap the muscles it works. Tap again to clear.
            {category === 'cardio' && ' Optional for cardio.'}
          </span>
          <span className="text-xs font-medium text-ink-3">
            For chest exercises, select upper, mid, lower, or any combination. Incline presses emphasize the upper chest.
          </span>
        </div>
        {MUSCLE_SECTIONS.map((section) => (
          <div key={section.title} className="flex flex-col gap-2">
            <span className="text-[11px] font-bold tracking-[0.06em] text-muted uppercase">{section.title}</span>
            <div className="flex flex-wrap gap-2">
              {section.muscles.map((group) => {
                const role = selection[group]
                return (
                  <button
                    key={group}
                    type="button"
                    onClick={() => cycle(group)}
                    aria-pressed={role !== undefined}
                    className={muscleChipClass(role !== undefined)}
                  >
                    {MUSCLE_LABELS[group]}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex gap-2.5">
        <button type="submit" disabled={saving} className={`${btnPrimaryClass} flex-1`}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={btnSecondaryClass}>
          Cancel
        </button>
      </div>
    </form>
  )
}
