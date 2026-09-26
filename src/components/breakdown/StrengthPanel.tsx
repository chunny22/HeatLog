import { useMemo, useState } from 'react'
import { useExercises } from '../../exercises/ExerciseContext'
import type { WeightUnit, WorkoutSession } from '../../types'
import { exercisesWithHistory, strengthSeries } from '../../utils/progress'
import { ChevronDownIcon } from '../icons'
import { cardClass, cardTitleClass } from '../ui'
import { filterByRange, type Range } from '../../utils/range'
import { RangeChips, StatBox } from './RangeChips'
import { TrendChart } from './TrendChart'

const round = (n: number) => Math.round(n).toLocaleString()

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function StrengthPanel({ sessions, unit }: { sessions: WorkoutSession[]; unit: WeightUnit }) {
  const { exercisesById } = useExercises()
  const exerciseIds = useMemo(() => exercisesWithHistory(sessions, exercisesById), [sessions, exercisesById])
  const [picked, setPicked] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('90d')

  const exerciseId = picked && exerciseIds.includes(picked) ? picked : exerciseIds[0]
  const all = useMemo(() => (exerciseId ? strengthSeries(sessions, exerciseId, unit, exercisesById) : []), [sessions, exerciseId, unit, exercisesById])
  const series = useMemo(() => filterByRange(all, range), [all, range])

  if (exerciseIds.length === 0) {
    return (
      <section className={cardClass}>
        <p className="py-16 text-center text-sm text-muted">
          Log a completed workout with weights to see your strength trend here.
        </p>
      </section>
    )
  }

  const first = series[0]
  const last = series[series.length - 1]
  const change = first && last ? last.oneRepMax - first.oneRepMax : 0
  const heaviest = series.reduce<(typeof series)[number]['heaviestSet'] | null>(
    (best, p) => (!best || p.heaviestSet.weight > best.weight ? p.heaviestSet : best),
    null,
  )

  return (
    <section className={`${cardClass} flex flex-col gap-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Strength</h2>
        <span className="relative">
          <select
            value={exerciseId}
            onChange={(e) => setPicked(e.target.value)}
            aria-label="Exercise"
            className="h-11 min-w-[200px] appearance-none rounded-field bg-inset pr-10 pl-4 text-base sm:text-[15px] font-semibold text-ink outline-none focus:bg-surface focus:ring-2 focus:ring-accent"
          >
            {exerciseIds.map((id) => (
              <option key={id} value={id}>
                {exercisesById[id]?.name ?? id}
              </option>
            ))}
          </select>
          <ChevronDownIcon size={16} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-3" />
        </span>
      </div>

      <div className="flex justify-end">
        <RangeChips value={range} onChange={setRange} />
      </div>

      {series.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No sets for this exercise in this time range.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBox
              label="Best est. 1RM"
              value={`${round(Math.max(...series.map((p) => p.oneRepMax)))} ${unit}`}
              note={series.length > 1 ? `${change >= 0 ? '▲' : '▼'} ${round(Math.abs(change))} ${unit}` : undefined}
              tone={change > 0 ? 'good' : undefined}
            />
            <StatBox
              label="Heaviest set"
              value={heaviest ? `${round(heaviest.weight)} ${unit}` : '—'}
              note={heaviest ? `× ${heaviest.reps} reps` : undefined}
            />
            <StatBox label="Sessions" value={String(series.length)} />
          </div>

          <TrendChart
            points={series.map((p) => ({ date: p.date, value: p.oneRepMax }))}
            formatValue={(v) => `${round(v)} ${unit}`}
          />

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold tracking-[0.06em] text-muted uppercase">
                <th className="pb-2 font-bold">Session</th>
                <th className="pb-2 font-bold">Best set</th>
                <th className="pb-2 text-right font-bold">Est. 1RM</th>
              </tr>
            </thead>
            <tbody>
              {[...series]
                .reverse()
                .slice(0, 6)
                .map((p) => (
                  <tr key={p.date} className="border-t border-line">
                    <td className="py-2.5 text-ink-2">{formatDate(p.date)}</td>
                    <td className="py-2.5 text-ink-2">
                      {round(p.bestSet.weight)} {unit} × {p.bestSet.reps}
                    </td>
                    <td className="py-2.5 text-right font-bold text-ink">{round(p.oneRepMax)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <p className="text-xs text-muted">
            Est. 1RM = weight × (1 + reps ÷ 30), from your best set each session. Only completed workouts count; kg and lb
            are converted to {unit}.
          </p>
        </>
      )}
    </section>
  )
}
