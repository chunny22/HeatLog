import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../supabase'
import type { FitnessGoal, WorkoutSession } from '../types'
import { useExercises } from '../exercises/ExerciseContext'
import { buildDaySummary, fingerprintSessions } from '../utils/dayInsight'

interface DayInsightRow {
  insight: string
  sessions_fingerprint: string
}

// `enabled` is false while the user has the AI Coach hidden: nothing is fetched or
// generated then, so a hidden coach costs no AI requests.
export function useDayInsight(date: string, sessions: WorkoutSession[], goals: FitnessGoal[], enabled = true) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Custom exercises load after sign-in. Wait for them before generating, so the
  // AI never sees a day with an exercise missing, and read the lookup through a
  // ref so it loading doesn't itself count as "the data changed" and re-run.
  const { exercisesById, ready } = useExercises()
  const exercisesRef = useRef(exercisesById)
  useEffect(() => {
    exercisesRef.current = exercisesById
  }, [exercisesById])

  // Derive stable primitive keys from `sessions`/`goals` so a caller passing
  // a new-but-equal array/object each render (e.g. `profile?.goals ?? [...]`)
  // doesn't look like "the data changed" to useCallback/useEffect -- only an
  // actual content change (a workout added/removed, or a different goal set)
  // should re-trigger a fetch-or-generate cycle.
  const fingerprint = useMemo(() => fingerprintSessions(sessions), [sessions])
  const goalsKey = useMemo(() => [...goals].sort().join(','), [goals])

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: fnData, error: fnError } = await supabase.functions.invoke('day-insight', {
      body: { goals, exercises: buildDaySummary(sessions, exercisesRef.current) },
    })

    if (fnError || !fnData?.insight) {
      setError(fnError?.message ?? 'Failed to generate insight')
      setLoading(false)
      return
    }

    const newInsight: string = fnData.insight
    const { data: userData } = await supabase.auth.getUser()

    await supabase.from('day_insights').upsert({
      user_id: userData.user?.id,
      date,
      insight: newInsight,
      sessions_fingerprint: fingerprint,
    })

    setInsight(newInsight)
    setLoading(false)
    // sessions/goals are intentionally omitted -- fingerprint/goalsKey already
    // capture everything about them that should cause this to be recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, fingerprint, goalsKey])

  useEffect(() => {
    if (!ready || !enabled) return
    let cancelled = false

    async function load() {
      if (sessions.length === 0) {
        if (!cancelled) {
          setInsight(null)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      const { data } = await supabase
        .from('day_insights')
        .select('insight, sessions_fingerprint')
        .eq('date', date)
        .maybeSingle()

      if (cancelled) return

      const row = data as DayInsightRow | null
      if (row && row.sessions_fingerprint === fingerprint) {
        setInsight(row.insight)
        setLoading(false)
        return
      }

      await generate()
    }

    load()

    return () => {
      cancelled = true
    }
    // sessions is intentionally omitted -- fingerprint already changes value
    // whenever sessions does (including becoming/leaving empty), so this only
    // re-runs on an actual content change, not a same-content re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, fingerprint, generate, ready, enabled])

  return { insight, loading, error, regenerate: generate }
}
