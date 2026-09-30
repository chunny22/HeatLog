import { supabase } from '../supabase'
import type { WorkoutSession } from '../types'
import { duplicateAsPlan, validWorkoutDate } from '../utils/sessionSchedule'

export interface SessionRow {
  id: string
  date: string
  notes: string | null
  entries: WorkoutSession['entries']
  status: WorkoutSession['status']
}

export const SESSION_COLUMNS = 'id, date, notes, entries, status'
export const rowToSession = (row: SessionRow): WorkoutSession => ({ ...row, notes: row.notes ?? undefined })
export type SessionActionResult = { error: string; session?: never } | { error: null; session: WorkoutSession }

export async function moveWorkout(id: string, date: string): Promise<SessionActionResult> {
  if (!validWorkoutDate(date)) return { error: 'Choose a valid date.' }
  try {
    const { data, error } = await supabase.from('workout_sessions').update({ date }).eq('id', id).select(SESSION_COLUMNS).single()
    if (error) return { error: error.message }
    return { error: null, session: rowToSession(data as SessionRow) }
  } catch {
    return { error: 'Could not move the workout. Check your connection and try again.' }
  }
}

export async function duplicateWorkout(id: string, date: string): Promise<SessionActionResult> {
  if (!validWorkoutDate(date)) return { error: 'Choose a valid date.' }
  try {
    // Fetch the current source through RLS; never reuse its id or ownership fields.
    const { data: source, error: readError } = await supabase.from('workout_sessions').select(SESSION_COLUMNS).eq('id', id).single()
    if (readError) return { error: readError.message }
    const plan = duplicateAsPlan(rowToSession(source as SessionRow), date)
    const { data, error } = await supabase.from('workout_sessions').insert({ ...plan, notes: plan.notes ?? null }).select(SESSION_COLUMNS).single()
    if (error) return { error: error.message }
    return { error: null, session: rowToSession(data as SessionRow) }
  } catch {
    return { error: 'Could not duplicate the workout. Check your connection before trying again.' }
  }
}
