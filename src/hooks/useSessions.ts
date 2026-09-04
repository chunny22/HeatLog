import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { WorkoutEntry, WorkoutSession, WorkoutStatus } from '../types'

interface SessionRow {
  id: string
  date: string
  notes: string | null
  entries: WorkoutEntry[]
  status: WorkoutStatus
}

function rowToSession(row: SessionRow): WorkoutSession {
  return { id: row.id, date: row.date, notes: row.notes ?? undefined, entries: row.entries, status: row.status }
}

export function useSessions() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('workout_sessions')
      .select('id, date, notes, entries, status')
      .order('date', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setSessions((data as SessionRow[]).map(rowToSession))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addSession = useCallback(
    async (date: string, entries: WorkoutEntry[], status: WorkoutStatus, notes?: string) => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      const { error } = await supabase
        .from('workout_sessions')
        .insert({ date, entries, notes: notes ?? null, status, user_id: userId })
      if (error) return { error: error.message }
      await refresh()
      return { error: null }
    },
    [refresh],
  )

  const completeSession = useCallback(
    async (id: string, entries: WorkoutEntry[]) => {
      const { error } = await supabase
        .from('workout_sessions')
        .update({ entries, status: 'completed' satisfies WorkoutStatus })
        .eq('id', id)
      if (error) return { error: error.message }
      await refresh()
      return { error: null }
    },
    [refresh],
  )

  const deleteSession = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
      if (error) return { error: error.message }
      await refresh()
      return { error: null }
    },
    [refresh],
  )

  return { sessions, loading, error, refresh, addSession, completeSession, deleteSession }
}
