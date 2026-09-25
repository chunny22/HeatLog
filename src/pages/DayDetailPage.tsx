import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { BodyMapBack } from '../components/bodymap/BodyMapBack'
import { BodyMapFront } from '../components/bodymap/BodyMapFront'
import { IntensityLegend } from '../components/bodymap/IntensityLegend'
import { DayDetailPanel } from '../components/calendar/DayDetailPanel'
import { DayInsightBar } from '../components/DayInsightBar'
import { ArrowLeftIcon } from '../components/icons'
import { cardClass, cardTitleClass, pageClass, pageTitleClass, panelClass } from '../components/ui'
import { useDayInsight } from '../hooks/useDayInsight'
import { useMuscleVolume } from '../hooks/useMuscleVolume'
import { useProfile } from '../profile/ProfileContext'
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

  const day = new Date(`${date}T00:00:00`)
  const weekday = day.toLocaleDateString('en-US', { weekday: 'long' })
  const fullDate = day.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className={`${pageClass} pb-32`}>
      <div className="flex items-center gap-4">
        <Link
          to="/"
          aria-label="Back to calendar"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-card transition-colors hover:bg-sunken"
        >
          <ArrowLeftIcon />
        </Link>
        <div>
          <div className="text-[13px] font-semibold text-muted">{weekday}</div>
          <h1 className={pageTitleClass}>{fullDate}</h1>
        </div>
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <Alert tone="error">{error}</Alert>}

      <section className={`${cardClass} flex flex-col gap-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className={cardTitleClass}>Muscles worked</h2>
          <IntensityLegend />
        </div>
        <p className="-mt-2 text-xs text-muted">
          Colour follows volume (reps × weight), adjusted for how hard each set felt when you logged its RPE.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className={`${panelClass} flex flex-col items-center gap-3`}>
            <BodyMapFront normalized={normalized} raw={raw} />
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink-3">Front</span>
          </div>
          <div className={`${panelClass} flex flex-col items-center gap-3`}>
            <BodyMapBack normalized={normalized} raw={raw} />
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-ink-3">Back</span>
          </div>
        </div>
      </section>

      <DayDetailPanel date={date} sessions={daySessions} onDeleteSession={deleteSession} />

      {daySessions.length > 0 ? (
        <DayInsightBar insight={insight} loading={insightLoading} error={insightError} onRegenerate={regenerate} />
      ) : (
        <p className="text-center text-[13px] text-muted">Log a workout to get AI coaching feedback.</p>
      )}
    </div>
  )
}
