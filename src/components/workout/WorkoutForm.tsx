import { useState } from 'react'
import { EXERCISES_BY_ID } from '../../data/exercises'
import type { Exercise, SetEntry, WorkoutEntry, WorkoutStatus } from '../../types'
import { ExercisePicker } from './ExercisePicker'
import { SetRow } from './SetRow'

const DEFAULT_SET: SetEntry = { reps: 0, weight: 0, unit: 'lb' }

interface WorkoutFormProps {
  date: string
  onDateChange: (date: string) => void
  onSave: (entries: WorkoutEntry[], status: WorkoutStatus, notes?: string) => Promise<{ error: string | null }>
}

export function WorkoutForm({ date, onDateChange, onSave }: WorkoutFormProps) {
  const [status, setStatus] = useState<WorkoutStatus>('planned')
  const [entries, setEntries] = useState<WorkoutEntry[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const addExercise = (exercise: Exercise) => {
    if (entries.some((e) => e.exerciseId === exercise.id)) return
    setEntries([...entries, { exerciseId: exercise.id, sets: [{ ...DEFAULT_SET }] }])
  }

  const removeExercise = (exerciseId: string) => {
    setEntries(entries.filter((e) => e.exerciseId !== exerciseId))
  }

  const updateSets = (exerciseId: string, sets: SetEntry[]) => {
    setEntries(entries.map((e) => (e.exerciseId === exerciseId ? { ...e, sets } : e)))
  }

  const handleSave = async () => {
    if (entries.length === 0) return
    setSaving(true)
    setError(null)

    const entriesToSave =
      status === 'planned'
        ? entries.map((entry) => ({
            ...entry,
            sets: entry.sets.map((set) => ({ ...set, intensity: undefined })),
          }))
        : entries

    const result = await onSave(entriesToSave, status, notes || undefined)
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setEntries([])
      setNotes('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm text-gray-700">
        Date
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-fit rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
        />
      </label>

      <div className="flex gap-1">
        <button
          onClick={() => setStatus('planned')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            status === 'planned' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Plan for later
        </button>
        <button
          onClick={() => setStatus('completed')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            status === 'completed' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Log as done
        </button>
      </div>

      <ExercisePicker onAdd={addExercise} />

      <div className="flex flex-col gap-3">
        {entries.map((entry) => {
          const exercise = EXERCISES_BY_ID[entry.exerciseId]
          return (
            <div key={entry.exerciseId} className="rounded-xl border border-gray-200 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">{exercise?.name}</h4>
                <button
                  onClick={() => removeExercise(entry.exerciseId)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove exercise
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {entry.sets.map((set, i) => (
                  <SetRow
                    key={i}
                    index={i}
                    set={set}
                    showIntensity={status === 'completed'}
                    onChange={(updated) => {
                      const sets = [...entry.sets]
                      sets[i] = updated
                      updateSets(entry.exerciseId, sets)
                    }}
                    onRemove={() => updateSets(entry.exerciseId, entry.sets.filter((_, si) => si !== i))}
                  />
                ))}
              </div>
              <button
                onClick={() => updateSets(entry.exerciseId, [...entry.sets, { ...DEFAULT_SET }])}
                className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
              >
                + Add set
              </button>
            </div>
          )
        })}
      </div>

      {entries.length > 0 && (
        <>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-500"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-green-600">{status === 'planned' ? 'Plan saved.' : 'Workout saved.'}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'Saving…' : status === 'planned' ? 'Save plan' : 'Save workout'}
          </button>
        </>
      )}
    </div>
  )
}
