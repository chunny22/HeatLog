import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BodyMapBack } from '../components/bodymap/BodyMapBack'
import { BodyMapFront } from '../components/bodymap/BodyMapFront'
import { IntensityLegend } from '../components/bodymap/IntensityLegend'
import { DayDetailPanel } from '../components/calendar/DayDetailPanel'
import { DayInsightBar } from '../components/DayInsightBar'
import { useDayInsight } from '../hooks/useDayInsight'
import { useMuscleVolume } from '../hooks/useMuscleVolume'
import { useProfile } from '../hooks/useProfile'
import { useSessions } from '../hooks/useSessions'
import type { FitnessGoal } from '../types'

const DEFAULT_GOALS: FitnessGoal[] = ['general_fitness']

export function DayDetailPage() {
  const { date } = useParams<{ date: string }>()
  const { sessions, loading, error, deleteSession } = useSessions()
  const { profile } = useProfile()

  const daySessions = useMemo(() => sessions.filter((s) => s.date === date), [sessions, date])
  const { normalized, raw } = useMuscleVolume(sessions, date, date)
  const {
    insight,
    loading: insightLoading,
    error: insightError,
    regenerate,
  } = useDayInsight(date ?? '', daySessions, profile?.goals ?? DEFAULT_GOALS)

  if (!date) return null

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-20">
      <Link to="/" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
        ← Back to calendar
      </Link>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Muscles worked this day</h2>
        <IntensityLegend />
      </div>
      <div className="mb-4 flex flex-wrap justify-center gap-8 rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col items-center gap-2">
          <BodyMapFront normalized={normalized} raw={raw} />
          <span className="text-xs text-gray-400">Front</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <BodyMapBack normalized={normalized} raw={raw} />
          <span className="text-xs text-gray-400">Back</span>
        </div>
      </div>

      <DayDetailPanel date={date} sessions={daySessions} onDeleteSession={deleteSession} />

      {daySessions.length > 0 ? (
        <DayInsightBar insight={insight} loading={insightLoading} error={insightError} onRegenerate={regenerate} />
      ) : (
        <p className="mt-4 text-center text-xs text-gray-400">Log a workout to get AI coaching feedback.</p>
      )}
    </div>
  )
}
