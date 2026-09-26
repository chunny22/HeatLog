import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExercises } from '../exercises/ExerciseContext'
import { Alert } from '../components/Alert'
import { btnPrimaryClass, cardClass, cardTitleClass, pageClass, pageTitleClass } from '../components/ui'
import { SetRow, SetRowHeader } from '../components/workout/SetRow'
import { CardioForm } from '../components/workout/CardioForm'
import { isCardioEntry, newCardioLog, validateCardioEntries } from '../utils/cardio'
import { useProfile } from '../profile/ProfileContext'
import { useSessions } from '../hooks/useSessions'
import type { SetEntry, WorkoutEntry } from '../types'

export function CompleteWorkoutPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { sessions, loading, completeSession } = useSessions()
  const { exercisesById, ready } = useExercises()
  const { profile } = useProfile()
  const session = sessions.find((s) => s.id === id)

  const [entries, setEntries] = useState<WorkoutEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadedId, setLoadedId] = useState<string | null>(null)

  useEffect(() => {
    if (!session || !ready || loadedId === session.id) return
    setEntries(session.entries.map((entry) => isCardioEntry(entry, exercisesById[entry.exerciseId])
      ? { ...entry, cardio: entry.cardio ?? newCardioLog(entry.exerciseId, profile?.unitPreference ?? 'lb') }
      : entry))
    setLoadedId(session.id)
  }, [session, ready, exercisesById, profile?.unitPreference, loadedId])

  const updateSets = (exerciseId: string, sets: SetEntry[]) => {
    setEntries(entries.map((e) => (e.exerciseId === exerciseId ? { ...e, sets } : e)))
  }

  const handleComplete = async () => {
    if (!id) return
    const problem = validateCardioEntries(entries, exercisesById)
    if (problem) { setError(problem); return }
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

  if (loading || !ready || (session && loadedId !== session.id)) {
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
          {session.date} — adjust your workout details and record how hard it felt (RPE).
        </p>
      </div>

      {entries.map((entry) => {
        const exercise = exercisesById[entry.exerciseId]
        return (
          <section key={entry.exerciseId} className={`${cardClass} flex flex-col gap-3.5`}>
            <h2 className={cardTitleClass}>{exercise?.name}</h2>
            {entry.cardio ? (
              <>
                {entry.sets.length > 0 && <p className="text-xs text-muted">Earlier entry: {entry.sets.map((set) => `${set.reps} × ${set.weight} ${set.unit}`).join(' · ')}</p>}
                <CardioForm value={entry.cardio} showIntensity onChange={(cardio) => {
                  setError(null)
                  setEntries((current) => current.map((e) => e.exerciseId === entry.exerciseId ? { ...e, cardio } : e))
                }} />
              </>
            ) : (
              <>
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
              </>
            )}
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
