import { useMemo, useState, type FormEvent } from 'react'
import { useConfirm } from '../../hooks/useConfirm'
import { useWeightLogs } from '../../hooks/useWeightLogs'
import type { WeightUnit } from '../../types'
import { todayISO } from '../../utils/date'
import { convertWeight } from '../../utils/progress'
import { Alert } from '../Alert'
import { TrashIcon } from '../icons'
import { btnPrimaryClass, cardClass, cardTitleClass, iconBtnSmClass } from '../ui'
import { filterByRange, type Range } from '../../utils/range'
import { RangeChips, StatBox } from './RangeChips'
import { TrendChart } from './TrendChart'

const format = (n: number) => (Math.round(n * 10) / 10).toLocaleString(undefined, { minimumFractionDigits: 0 })

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function BodyWeightPanel({ unit }: { unit: WeightUnit }) {
  const { logs, loading, error, addLog, deleteLog } = useWeightLogs()
  const { confirm, dialog } = useConfirm()
  const [range, setRange] = useState<Range>('90d')
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState(todayISO())
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const points = useMemo(
    () => logs.map((l) => ({ id: l.id, date: l.date, value: convertWeight(l.weight, l.unit, unit) })),
    [logs, unit],
  )
  const inRange = useMemo(() => filterByRange(points, range), [points, range])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const value = Number(weight)
    if (!(value > 0)) return
    setSaving(true)
    setFormError(null)
    const result = await addLog(date, value, unit)
    if (result.error) setFormError(result.error)
    else setWeight('')
    setSaving(false)
  }

  const first = inRange[0]
  const last = inRange[inRange.length - 1]
  const change = first && last ? last.value - first.value : 0

  return (
    <section className={`${cardClass} flex flex-col gap-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Body weight</h2>
        <RangeChips value={range} onChange={setRange} />
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {loading && logs.length === 0 && <p className="text-sm text-muted">Loading…</p>}

      {inRange.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="Current" value={`${format(last.value)} ${unit}`} />
            <StatBox
              label="Change"
              value={inRange.length > 1 ? `${change > 0 ? '+' : change < 0 ? '−' : ''}${format(Math.abs(change))} ${unit}` : '—'}
            />
            <StatBox label="Entries" value={String(inRange.length)} />
          </div>
          <TrendChart
            points={inRange.map((p) => ({ date: p.date, value: p.value }))}
            formatValue={(v) => `${format(v)} ${unit}`}
          />
        </>
      ) : (
        !loading && (
          <p className="py-10 text-center text-sm text-muted">
            {logs.length === 0
              ? 'No weigh-ins yet. Log your weight below to start tracking.'
              : 'No weigh-ins in this time range.'}
          </p>
        )
      )}

      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
        <span className="flex h-12 min-w-[150px] flex-1 items-center gap-2 rounded-field bg-inset pr-4 pl-4 transition-shadow focus-within:bg-surface focus-within:ring-2 focus-within:ring-accent">
          <input
            type="number"
            required
            min={0}
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight"
            aria-label="Weight"
            className="w-0 min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
          />
          <span className="text-sm font-bold text-ink-3">{unit}</span>
        </span>
        <input
          type="date"
          required
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date"
          className="h-12 rounded-field bg-inset px-4 text-[15px] font-semibold text-ink outline-none transition-shadow focus:bg-surface focus:ring-2 focus:ring-accent"
        />
        <button type="submit" disabled={saving} className={btnPrimaryClass}>
          {saving ? 'Saving…' : 'Log'}
        </button>
      </form>
      {formError && <Alert tone="error">{formError}</Alert>}

      {points.length > 0 && (
        <ul className="flex flex-col">
          {[...points]
            .reverse()
            .slice(0, 5)
            .map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 border-t border-line py-2 text-sm">
                <span className="text-ink-2">{formatDate(p.date)}</span>
                <span className="flex items-center gap-3">
                  <span className="font-bold text-ink">
                    {format(p.value)} {unit}
                  </span>
                  <button
                    onClick={async () => {
                      if (await confirm(`Delete the ${formatDate(p.date)} weigh-in?`)) deleteLog(p.id)
                    }}
                    aria-label={`Delete weigh-in ${formatDate(p.date)}`}
                    title="Delete weigh-in"
                    className={iconBtnSmClass}
                  >
                    <TrashIcon size={15} />
                  </button>
                </span>
              </li>
            ))}
        </ul>
      )}
      {dialog}
    </section>
  )
}
