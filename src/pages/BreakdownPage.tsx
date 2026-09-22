import { useMemo } from 'react'
import { Alert } from '../components/Alert'
import { ActivityLineChart } from '../components/breakdown/ActivityLineChart'
import { ActivityStatTile } from '../components/breakdown/ActivityStatTile'
import { cardClass, cardTitleClass, pageClass, pageTitleClass } from '../components/ui'
import { useSessions } from '../hooks/useSessions'
import { computeDailyVolume, findLeastActiveDay, findMostActiveDay } from '../utils/dailyActivity'

const WINDOW_DAYS = 30

export function BreakdownPage() {
  const { sessions, loading, error } = useSessions()

  const series = useMemo(() => computeDailyVolume(sessions, WINDOW_DAYS), [sessions])
  const mostActive = useMemo(() => findMostActiveDay(series), [series])
  const leastActive = useMemo(() => findLeastActiveDay(series), [series])
  const hasActivity = series.some((d) => d.volume > 0)

  return (
    <div className={pageClass}>
      <div className="flex flex-col gap-1.5">
        <h1 className={pageTitleClass}>Activity Breakdown</h1>
        <p className="text-[15px] text-ink-3">Training volume (reps × weight) over the last {WINDOW_DAYS} days.</p>
      </div>

      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <ActivityStatTile label="Most active day" day={mostActive} accent="indigo" />
        <ActivityStatTile label="Least active day" day={leastActive} accent="gray" />
      </div>

      <section className={`${cardClass} flex flex-col gap-5`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={cardTitleClass}>Daily volume</h2>
          <span className="rounded-full bg-sunken px-3 py-1.5 text-xs font-bold text-ink-2">
            Last {WINDOW_DAYS} days
          </span>
        </div>
        {hasActivity ? (
          <ActivityLineChart series={series} />
        ) : (
          <p className="py-16 text-center text-sm text-muted">No completed workouts in the last {WINDOW_DAYS} days.</p>
        )}
      </section>
    </div>
  )
}
