import { useRef, useState, type FormEvent } from 'react'
import type { WorkoutSession } from '../../types'
import { nextWorkoutDate, validWorkoutDate } from '../../utils/sessionSchedule'
import { Alert } from '../Alert'
import { CalendarIcon, CopyIcon } from '../icons'
import { btnPrimaryClass, btnSecondaryClass, btnSoftSmClass } from '../ui'
import { WorkoutDatePicker } from './WorkoutDatePicker'

export type DateAction = 'move' | 'duplicate'
export type ChangeWorkoutDate = (id: string, date: string) => Promise<{ error: string | null }>

interface WorkoutDateActionsProps {
  session: WorkoutSession
  onMove: ChangeWorkoutDate
  onDuplicate: ChangeWorkoutDate
  onSuccess: (action: DateAction, date: string) => void
}

export function WorkoutDateActions({ session, onMove, onDuplicate, onSuccess }: WorkoutDateActionsProps) {
  const [action, setAction] = useState<DateAction | null>(null)
  const [date, setDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const inFlight = useRef(false)

  const open = (next: DateAction) => {
    setDate(nextWorkoutDate(session.date))
    setError(null)
    setAction(next)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!action || inFlight.current) return
    if (!validWorkoutDate(date)) { setError('Choose a valid date.'); return }
    if (date === session.date) { setError('Choose a different date.'); return }
    inFlight.current = true
    setSaving(true)
    setError(null)
    try {
      const result = await (action === 'move' ? onMove : onDuplicate)(session.id, date)
      if (result.error) { setError(result.error); return }
      setAction(null)
      onSuccess(action, date)
    } catch {
      setError('Could not save the change. Check your connection and try again.')
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }

  if (!action) return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={btnSoftSmClass} onClick={() => open('move')}>
        <CalendarIcon size={15} /> Move
      </button>
      <button type="button" className={btnSoftSmClass} onClick={() => open('duplicate')}>
        <CopyIcon size={15} /> Duplicate
      </button>
    </div>
  )

  return (
    <form aria-label={action === 'move' ? 'Move workout' : 'Duplicate workout'} onSubmit={submit}
      className="flex flex-col gap-3 rounded-panel bg-surface p-4"
      onKeyDown={(event) => { if (event.key === 'Escape' && !saving) setAction(null) }}>
      <WorkoutDatePicker label={action === 'move' ? 'Move to date' : 'Duplicate to date'} value={date} disabled={saving}
        onChange={(nextDate) => { setDate(nextDate); setError(null) }} />
      {action === 'duplicate' && <p className="text-xs text-ink-3">Creates a planned workout with the same exercises and notes. Effort ratings start blank.</p>}
      {error && <Alert tone="error">{error}</Alert>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className={btnPrimaryClass}>
          {saving ? 'Saving…' : action === 'move' ? 'Move workout' : 'Duplicate as plan'}
        </button>
        <button type="button" disabled={saving} className={btnSecondaryClass} onClick={() => setAction(null)}>Cancel</button>
      </div>
    </form>
  )
}
