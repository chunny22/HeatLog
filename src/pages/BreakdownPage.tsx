import { useMemo } from 'react'
import { ActivityLineChart } from '../components/breakdown/ActivityLineChart'
import { ActivityStatTile } from '../components/breakdown/ActivityStatTile'
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
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-1 text-lg font-semibold text-gray-900">Activity Breakdown</h1>
      <p className="mb-4 text-sm text-gray-500">Training volume (reps × weight) over the last {WINDOW_DAYS} days.</p>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <ActivityStatTile label="Most Active Day" day={mostActive} accent="indigo" />
        <ActivityStatTile label="Least Active Day" day={leastActive} accent="gray" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {hasActivity ? (
          <ActivityLineChart series={series} />
        ) : (
          <p className="py-16 text-center text-sm text-gray-400">
            No completed workouts in the last {WINDOW_DAYS} days.
          </p>
        )}
      </div>
    </div>
  )
}
