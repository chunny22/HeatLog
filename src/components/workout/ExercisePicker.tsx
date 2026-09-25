import { useMemo, useState } from 'react'
import { useExercises } from '../../exercises/ExerciseContext'
import type { Exercise, ExerciseCategory } from '../../types'
import { isCustomExerciseId } from '../../utils/customExercise'
import { CheckIcon, PlusIcon, SearchIcon } from '../icons'
import { cardClass, cardTitleClass, chipClass } from '../ui'
import { ExerciseForm } from './ExerciseForm'

const CATEGORIES: (ExerciseCategory | 'all')[] = ['all', 'push', 'pull', 'legs', 'core', 'cardio']

interface ExercisePickerProps {
  onAdd: (exercise: Exercise) => void
  addedIds?: string[]
}

export function ExercisePicker({ onAdd, addedIds = [] }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all')
  const { exercises, addCustom } = useExercises()
  // Set while the "add your own" form is open; holds the name to start it with.
  const [creating, setCreating] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesQuery = exercise.name.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || exercise.category === category
      return matchesQuery && matchesCategory
    })
  }, [exercises, query, category])

  if (creating !== null) {
    return (
      <section className={`${cardClass} flex flex-col gap-4`}>
        <ExerciseForm
          title="New exercise"
          submitLabel="Save and add to workout"
          initial={{ name: creating, category: category === 'all' ? 'push' : category, muscles: [] }}
          onSubmit={async (input) => {
            const result = await addCustom(input)
            if (result.exercise) {
              onAdd(result.exercise)
              setCreating(null)
              setQuery('')
            }
            return { error: result.error }
          }}
          onCancel={() => setCreating(null)}
        />
      </section>
    )
  }

  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <h2 className={cardTitleClass}>Add exercises</h2>
      <label className="flex h-[52px] items-center gap-2.5 rounded-full bg-inset px-[18px] text-ink-3 transition-shadow focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search exercises…"
          aria-label="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-base sm:text-[15px] text-ink outline-none placeholder:text-muted"
        />
      </label>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`${chipClass(category === cat)} capitalize`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="-mx-2 flex max-h-72 flex-col gap-1.5 overflow-y-auto px-2">
        {filtered.map((exercise) => {
          const added = addedIds.includes(exercise.id)
          return (
            <button
              key={exercise.id}
              onClick={() => onAdd(exercise)}
              aria-label={added ? `${exercise.name} (added)` : `Add ${exercise.name}`}
              className={`flex items-center gap-3 rounded-[18px] py-2 pr-2 pl-4 text-left transition-colors ${
                added ? 'bg-accent-soft' : 'hover:bg-inset'
              }`}
            >
              <span className="flex-1 text-[15px] font-semibold text-ink">{exercise.name}</span>
              {isCustomExerciseId(exercise.id) && (
                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-ink">Yours</span>
              )}
              <span className="rounded-full bg-sunken px-2.5 py-0.5 text-xs font-semibold text-ink-3 capitalize">
                {exercise.category}
              </span>
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  added ? 'bg-accent text-white' : 'bg-sunken text-ink'
                }`}
              >
                {added ? <CheckIcon size={16} /> : <PlusIcon size={16} />}
              </span>
            </button>
          )
        })}
        {filtered.length === 0 && <p className="px-2 py-4 text-center text-sm text-muted">No matches.</p>}
      </div>
      <button
        type="button"
        onClick={() => setCreating(query.trim())}
        className="flex min-h-[54px] items-center gap-3 rounded-[18px] border-2 border-dashed border-accent px-4 py-2 text-left text-[15px] font-bold text-accent-ink transition-colors hover:bg-accent-soft"
      >
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-accent text-white">
          <PlusIcon size={16} strokeWidth={2.5} />
        </span>
        <span className="min-w-0 break-words">
          {query.trim() && filtered.length === 0 ? `Add "${query.trim()}" as your own exercise` : 'Add your own exercise'}
        </span>
      </button>
    </section>
  )
}
