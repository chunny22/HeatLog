import { useMemo, useState } from 'react'
import { Alert } from '../components/Alert'
import { ActivityLineChart } from '../components/breakdown/ActivityLineChart'
import { ActivityStatTile } from '../components/breakdown/ActivityStatTile'
import { BodyWeightPanel } from '../components/breakdown/BodyWeightPanel'
import { StrengthPanel } from '../components/breakdown/StrengthPanel'
import { SlidingSegmented } from '../components/SlidingSegmented'
import { cardClass, cardTitleClass, pageClass, pageTitleClass } from '../components/ui'
import { useProfile } from '../hooks/useProfile'
import { useSessions } from '../hooks/useSessions'
import { computeDailyVolume, findLeastActiveDay, findMostActiveDay } from '../utils/dailyActivity'

const WINDOW_DAYS = 30

type Tab = 'activity' | 'strength' | 'body'
const TABS: { value: Tab; label: string }[] = [
  { value: 'activity', label: 'Activity' },
  { value: 'strength', label: 'Strength' },
  { value: 'body', label: 'Body weight' },
]

export function BreakdownPage() {
  const { sessions, loading, error } = useSessions()
  const { profile } = useProfile()
  const [tab, setTab] = useState<Tab>('activity')

  const series = useMemo(() => computeDailyVolume(sessions, WINDOW_DAYS), [sessions])
  const mostActive = useMemo(() => findMostActiveDay(series), [series])
  const leastActive = useMemo(() => findLeastActiveDay(series), [series])
  const hasActivity = series.some((d) => d.volume > 0)
  const unit = profile?.weightUnit ?? 'lb'

  return (
    <div className={pageClass}>
      <div className="flex flex-col gap-1.5">
        <h1 className={pageTitleClass}>Progress</h1>
        <p className="text-[15px] text-ink-3">Activity, strength and body weight over time.</p>
      </div>

      <SlidingSegmented
        kind="tabs"
        ariaLabel="Progress view"
        options={TABS}
        value={tab}
        onChange={setTab}
        optionClassName="h-11 flex-1 px-4 text-sm font-bold"
      />

      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <Alert tone="error">{error}</Alert>}

      {tab === 'activity' && (
        <>
          <p className="text-[13px] text-ink-3">Training volume (reps × weight) over the last {WINDOW_DAYS} days.</p>
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
        </>
      )}

      {tab === 'strength' && <StrengthPanel sessions={sessions} unit={unit} />}
      {tab === 'body' && <BodyWeightPanel unit={unit} />}
    </div>
  )
}
