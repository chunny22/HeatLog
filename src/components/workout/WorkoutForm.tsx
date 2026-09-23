import { useState } from 'react'
import { EXERCISES_BY_ID } from '../../data/exercises'
import type { Exercise, SetEntry, WorkoutEntry, WorkoutSession, WorkoutStatus } from '../../types'
import { Alert } from '../Alert'
import { CalendarIcon, PlusIcon, TrashIcon } from '../icons'
import {
  btnPrimaryClass,
  btnSoftSmClass,
  cardClass,
  cardTitleClass,
  iconBtnDangerClass,
  labelClass,
  segmentClass,
  segmentedClass,
} from '../ui'
import { useProfile } from '../../profile/ProfileContext'
import { ExercisePicker } from './ExercisePicker'
import { LastTimeHint } from './LastTimeHint'
import { SetRow, SetRowHeader } from './SetRow'


interface WorkoutFormProps {
  date: string
  sessions: WorkoutSession[]
  onDateChange: (date: string) => void
  onSave: (entries: WorkoutEntry[], status: WorkoutStatus, notes?: string) => Promise<{ error: string | null }>
}

export function WorkoutForm({ date, sessions, onDateChange, onSave }: WorkoutFormProps) {
  const { profile } = useProfile()
  const defaultUnit = profile?.unitPreference ?? 'lb'
  const blankSet = (unit: SetEntry['unit'] = defaultUnit): SetEntry => ({ reps: 0, weight: 0, unit })
  const [status, setStatus] = useState<WorkoutStatus>('planned')
  const [entries, setEntries] = useState<WorkoutEntry[]>([])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const addExercise = (exercise: Exercise) => {
    if (entries.some((e) => e.exerciseId === exercise.id)) return
    setEntries([...entries, { exerciseId: exercise.id, sets: [blankSet()] }])
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
    <div className="flex flex-col gap-5">
      <section className={`${cardClass} flex flex-wrap items-end justify-between gap-4`}>
        <label className={labelClass}>
          Date
          <span className="flex h-12 items-center gap-2.5 rounded-field bg-inset px-4 text-ink-3 transition-shadow focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent">
            <CalendarIcon />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-[15px] font-semibold text-ink outline-none"
            />
          </span>
        </label>

        <div role="group" aria-label="Workout status" className={segmentedClass}>
          <button onClick={() => setStatus('planned')} aria-pressed={status === 'planned'} className={segmentClass(status === 'planned')}>
            Plan for later
          </button>
          <button
            onClick={() => setStatus('completed')}
            aria-pressed={status === 'completed'}
            className={segmentClass(status === 'completed')}
          >
            Log as done
          </button>
        </div>
      </section>

      {saved && <Alert tone="success">{status === 'planned' ? 'Plan saved.' : 'Workout saved.'}</Alert>}

      <ExercisePicker onAdd={addExercise} addedIds={entries.map((e) => e.exerciseId)} />

      {entries.map((entry) => {
        const exercise = EXERCISES_BY_ID[entry.exerciseId]
        return (
          <section key={entry.exerciseId} className={`${cardClass} flex flex-col gap-3.5`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className={cardTitleClass}>{exercise?.name}</h3>
              <button
                onClick={() => removeExercise(entry.exerciseId)}
                aria-label={`Remove ${exercise?.name ?? 'exercise'}`}
                title="Remove exercise"
                className={iconBtnDangerClass}
              >
                <TrashIcon size={17} />
              </button>
            </div>
            <LastTimeHint
              sessions={sessions}
              exerciseId={entry.exerciseId}
              date={date}
              onUse={(sets) => updateSets(entry.exerciseId, sets)}
            />
            <SetRowHeader showIntensity={status === 'completed'} />
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
            <button
              onClick={() => updateSets(entry.exerciseId, [...entry.sets, blankSet(entry.sets[entry.sets.length - 1]?.unit)])}
              className={`${btnSoftSmClass} self-start pl-3`}
            >
              <PlusIcon size={16} />
              Add set
            </button>
          </section>
        )
      })}

      {entries.length > 0 && (
        <section className={`${cardClass} flex flex-col gap-4`}>
          <label className={labelClass}>
            Notes (optional)
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="How did it feel?"
              className="resize-none rounded-[18px] bg-inset px-4 py-3.5 text-[15px] font-medium text-ink outline-none transition-shadow placeholder:font-normal placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-accent"
            />
          </label>

          {error && <Alert tone="error">{error}</Alert>}

          <button onClick={handleSave} disabled={saving} className={`${btnPrimaryClass} h-[54px] text-base`}>
            {saving ? 'Saving…' : status === 'planned' ? 'Save plan' : 'Save workout'}
          </button>
        </section>
      )}
    </div>
  )
}
