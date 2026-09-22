import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EXERCISES_BY_ID } from '../data/exercises'
import { Alert } from '../components/Alert'
import { btnPrimaryClass, cardClass, cardTitleClass, pageClass, pageTitleClass } from '../components/ui'
import { SetRow, SetRowHeader } from '../components/workout/SetRow'
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
    return <div className={`${pageClass} text-sm text-muted`}>Loading…</div>
  }

  if (!session) {
    return <div className={`${pageClass} text-sm text-muted`}>Workout not found.</div>
  }

  return (
    <div className={pageClass}>
      <div className="flex flex-col gap-1.5">
        <h1 className={pageTitleClass}>Mark Workout Done</h1>
        <p className="text-[15px] text-ink-3">
          {session.date} — adjust reps/weight if it differed from the plan, and fill in how hard each set felt (RPE).
        </p>
      </div>

      {entries.map((entry) => {
        const exercise = EXERCISES_BY_ID[entry.exerciseId]
        return (
          <section key={entry.exerciseId} className={`${cardClass} flex flex-col gap-3.5`}>
            <h2 className={cardTitleClass}>{exercise?.name}</h2>
            <SetRowHeader showIntensity />
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
          </section>
        )
      })}

      {error && <Alert tone="error">{error}</Alert>}

      <button onClick={handleComplete} disabled={saving} className={`${btnPrimaryClass} h-[54px] text-base`}>
        {saving ? 'Saving…' : 'Mark as completed'}
      </button>
    </div>
  )
}
