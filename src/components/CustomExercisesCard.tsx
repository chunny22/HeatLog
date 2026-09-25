import { useState } from 'react'
import { MUSCLE_LABELS } from '../data/muscles'
import { useExercises } from '../exercises/ExerciseContext'
import { useConfirm } from '../hooks/useConfirm'
import type { Exercise } from '../types'
import { Alert } from './Alert'
import { PencilIcon, TrashIcon } from './icons'
import { cardClass, cardTitleClass, iconBtnDangerClass, iconBtnSmClass } from './ui'
import { ExerciseForm } from './workout/ExerciseForm'

function summary(exercise: Exercise): string {
  const main = exercise.muscles.filter((m) => m.role === 'primary').map((m) => MUSCLE_LABELS[m.group])
  const extra = exercise.muscles.length - Math.min(main.length, 2)
  const shown = main.slice(0, 2).join(', ')
  const category = exercise.category[0].toUpperCase() + exercise.category.slice(1)
  if (exercise.muscles.length === 0) return category
  return `${category} · ${shown}${extra > 0 ? ` +${extra}` : ''}`
}

export function CustomExercisesCard() {
  const { customExercises, updateCustom, archiveCustom } = useExercises()
  const { confirm, dialog } = useConfirm()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const remove = async (exercise: Exercise) => {
    const message = `Remove "${exercise.name}"? It disappears from your list, but workouts you already logged with it are kept.`
    if (!(await confirm(message, 'Remove'))) return
    const result = await archiveCustom(exercise.id)
    setError(result.error)
  }

  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex flex-col gap-1">
        <h2 className={cardTitleClass}>Your exercises</h2>
        <p className="text-[13px] text-ink-3">Exercises you add from Log Workout show up here.</p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      {customExercises.length === 0 && (
        <p className="rounded-panel bg-inset px-4 py-5 text-center text-sm text-muted">
          Nothing yet. In Log Workout, use “Add your own exercise”.
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {customExercises.map((exercise) => (
          <li key={exercise.id} className="rounded-panel bg-inset p-3.5 sm:p-4">
            {editingId === exercise.id ? (
              <ExerciseForm
                title="Edit exercise"
                submitLabel="Save changes"
                initial={{ name: exercise.name, category: exercise.category, muscles: exercise.muscles }}
                excludeId={exercise.id}
                onSubmit={async (input) => {
                  const result = await updateCustom(exercise.id, input)
                  if (!result.error) setEditingId(null)
                  return result
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-bold text-ink">{exercise.name}</div>
                  <div className="text-xs text-muted">{summary(exercise)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingId(exercise.id)}
                  aria-label={`Edit ${exercise.name}`}
                  title="Edit"
                  className={iconBtnSmClass}
                >
                  <PencilIcon size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(exercise)}
                  aria-label={`Remove ${exercise.name}`}
                  title="Remove"
                  className={iconBtnDangerClass}
                >
                  <TrashIcon size={17} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {dialog}
    </section>
  )
}
