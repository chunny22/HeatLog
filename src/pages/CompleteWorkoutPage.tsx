import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EXERCISES_BY_ID } from '../data/exercises'
import { SetRow } from '../components/workout/SetRow'
import { useSessions } from '../hooks/useSessions'
import type { SetEntry, WorkoutEntry } from '../types'

export function CompleteWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, loading, completeSession } = useSessions()
  const session = sessions.find((s) => s.id === id)

  const [entries, setEntries] = useState<WorkoutEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) setEntries(session.entries)
  }, [session])

  const updateSets = (exerciseId: string, sets: SetEntry[]) => {
    setEntries(entries.map((e) => (e.exerciseId === exerciseId ? { ...e, sets } : e)))
  }

  const handleComplete = async () => {
    if (!id) return
    setSaving(true)
    setError(null)
    const result = await completeSession(id, entries)
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/')
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-gray-400">Loading…</div>
  }

  if (!session) {
    return <div className="mx-auto max-w-3xl px-4 py-6 text-sm text-gray-400">Workout not found.</div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Mark Workout Done</h1>
      <p className="mb-4 text-sm text-gray-500">
        {session.date} — adjust reps/weight if it differed from the plan, and fill in how hard each set felt (RPE).
      </p>

      <div className="flex flex-col gap-3">
        {entries.map((entry) => {
          const exercise = EXERCISES_BY_ID[entry.exerciseId]
          return (
            <div key={entry.exerciseId} className="rounded-xl border border-gray-200 p-3">
              <h4 className="mb-2 text-sm font-semibold text-gray-900">{exercise?.name}</h4>
              <div className="flex flex-col gap-2">
                {entry.sets.map((set, i) => (
                  <SetRow
                    key={i}
                    index={i}
                    set={set}
                    showIntensity
                    onChange={(updated) => {
                      const sets = [...entry.sets]
                      sets[i] = updated
                      updateSets(entry.exerciseId, sets)
                    }}
                    onRemove={() => updateSets(entry.exerciseId, entry.sets.filter((_, si) => si !== i))}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleComplete}
        disabled={saving}
        className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Mark as completed'}
      </button>
    </div>
  )
}
