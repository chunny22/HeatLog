import { useMemo, useState } from 'react'
import { EXERCISES } from '../../data/exercises'
import type { Exercise, ExerciseCategory } from '../../types'

const CATEGORIES: (ExerciseCategory | 'all')[] = ['all', 'push', 'pull', 'legs', 'core', 'cardio']

interface ExercisePickerProps {
  onAdd: (exercise: Exercise) => void
}

export function ExercisePicker({ onAdd }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<ExerciseCategory | 'all'>('all')

  const filtered = useMemo(() => {
    return EXERCISES.filter((exercise) => {
      const matchesQuery = exercise.name.toLowerCase().includes(query.toLowerCase())
      const matchesCategory = category === 'all' || exercise.category === category
      return matchesQuery && matchesCategory
    })
  }, [query, category])

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <input
        type="text"
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500"
      />
      <div className="mb-3 flex gap-1 overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium capitalize ${
              category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
        {filtered.map((exercise) => (
          <button
            key={exercise.id}
            onClick={() => onAdd(exercise)}
            className="flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-gray-100"
          >
            <span className="text-gray-800">{exercise.name}</span>
            <span className="text-xs text-gray-400 capitalize">{exercise.category}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="px-2 py-4 text-center text-sm text-gray-400">No matches.</p>}
      </div>
    </div>
  )
}
