import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { EXERCISES } from '../data/exercises'
import { supabase } from '../supabase'
import type { Exercise, ExerciseCategory } from '../types'
import { normalizeName, toCustomExerciseId, fromCustomExerciseId } from '../utils/customExercise'
import { retryWhile } from '../utils/retry'

interface CustomExerciseRow {
  id: string
  name: string
  category: ExerciseCategory
  muscles: Exercise['muscles']
  archived: boolean
}

export interface CustomExerciseInput {
  name: string
  category: ExerciseCategory
  muscles: Exercise['muscles']
}

interface ExerciseContextValue {
  /** Built-in plus the user's active custom exercises: what the picker offers. */
  exercises: Exercise[]
  /** Everything, including removed custom exercises, so old workouts still show their names. */
  exercisesById: Record<string, Exercise>
  /** The user's active custom exercises, newest first. */
  customExercises: Exercise[]
  /** False until the user's custom exercises have loaded (immediately true when signed out). */
  ready: boolean
  error: string | null
  /** Names a new/edited exercise must not duplicate (built-in + active custom). */
  takenNames: (excludeId?: string) => string[]
  addCustom: (input: CustomExerciseInput) => Promise<{ error: string | null; exercise?: Exercise }>
  updateCustom: (id: string, input: CustomExerciseInput) => Promise<{ error: string | null }>
  archiveCustom: (id: string) => Promise<{ error: string | null }>
}

const ExerciseContext = createContext<ExerciseContextValue | null>(null)

const COLUMNS = 'id, name, category, muscles, archived'
const BUILT_IN_BY_ID: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

const rowToExercise = (row: CustomExerciseRow): Exercise => ({
  id: toCustomExerciseId(row.id),
  name: row.name,
  category: row.category,
  muscles: row.muscles,
})

function friendlyError(message: string, code?: string): string {
  if (code === '23505') return 'That exercise is already in the list.'
  if (/row-level security/i.test(message)) return "You've reached the limit of 100 custom exercises."
  return message
}

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id ?? null
  const [rows, setRows] = useState<CustomExerciseRow[]>([])
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setRows([])
      setError(null)
      return
    }

    let cancelled = false
    ;(async () => {
      // A fresh token can be briefly rejected right after sign-in; retry a few times.
      const { data, error } = await retryWhile(
        async () => supabase.from('custom_exercises').select(COLUMNS).order('created_at', { ascending: false }),
        (result) => Boolean(result.error),
        [800, 1600, 3200],
      )
      if (cancelled) return
      if (error) setError(error.message)
      else {
        setError(null)
        setRows(data as CustomExerciseRow[])
      }
      // Ready even after a failure, so nothing waits on this forever.
      setLoadedFor(userId)
    })()

    return () => {
      cancelled = true
    }
  }, [userId])

  const ready = !userId || loadedFor === userId

  const active = useMemo(() => rows.filter((r) => !r.archived).map(rowToExercise), [rows])
  const exercises = useMemo(() => [...EXERCISES, ...active], [active])
  const exercisesById = useMemo(() => {
    const map = { ...BUILT_IN_BY_ID }
    for (const row of rows) map[toCustomExerciseId(row.id)] = rowToExercise(row)
    return map
  }, [rows])

  const takenNames = useCallback(
    (excludeId?: string) => [...EXERCISES, ...active].filter((e) => e.id !== excludeId).map((e) => e.name),
    [active],
  )

  const addCustom = useCallback<ExerciseContextValue['addCustom']>(async (input) => {
    const { data, error } = await supabase
      .from('custom_exercises')
      .insert({ name: normalizeName(input.name), category: input.category, muscles: input.muscles })
      .select(COLUMNS)
      .single()
    if (error) return { error: friendlyError(error.message, error.code) }
    const row = data as CustomExerciseRow
    setRows((prev) => [row, ...prev])
    return { error: null, exercise: rowToExercise(row) }
  }, [])

  const updateCustom = useCallback<ExerciseContextValue['updateCustom']>(async (id, input) => {
    const rowId = fromCustomExerciseId(id)
    const patch = { name: normalizeName(input.name), category: input.category, muscles: input.muscles }
    const { error } = await supabase.from('custom_exercises').update(patch).eq('id', rowId)
    if (error) return { error: friendlyError(error.message, error.code) }
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)))
    return { error: null }
  }, [])

  const archiveCustom = useCallback<ExerciseContextValue['archiveCustom']>(async (id) => {
    const rowId = fromCustomExerciseId(id)
    const { error } = await supabase.from('custom_exercises').update({ archived: true }).eq('id', rowId)
    if (error) return { error: friendlyError(error.message, error.code) }
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, archived: true } : r)))
    return { error: null }
  }, [])

  const value = useMemo(
    () => ({ exercises, exercisesById, customExercises: active, ready, error, takenNames, addCustom, updateCustom, archiveCustom }),
    [exercises, exercisesById, active, ready, error, takenNames, addCustom, updateCustom, archiveCustom],
  )

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>
}

export function useExercises(): ExerciseContextValue {
  const ctx = useContext(ExerciseContext)
  if (!ctx) throw new Error('useExercises must be used inside <ExerciseProvider>')
  return ctx
}
