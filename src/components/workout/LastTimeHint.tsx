import type { CardioLog, SetEntry, WorkoutSession } from '../../types'
import { copyCardioInterval, findLastCardio, formatCardioInterval } from '../../utils/cardio'
import { findLastPerformance } from '../../utils/progress'
import { RefreshIcon } from '../icons'

interface LastTimeHintProps {
  sessions: WorkoutSession[]
  exerciseId: string
  date: string
  onUse: (sets: SetEntry[]) => void
}

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatSets(sets: SetEntry[]): string {
  const sameUnit = sets.every((s) => s.unit === sets[0].unit)
  const parts = sets.map((s) => `${s.reps}×${s.weight > 0 ? s.weight : 'BW'}${sameUnit ? '' : ` ${s.unit}`}`)
  const anyWeighted = sets.some((s) => s.weight > 0)
  return `${parts.join(' · ')}${sameUnit && anyWeighted ? ` ${sets[0].unit}` : ''}`
}

export function LastTimeHint({ sessions, exerciseId, date, onUse }: LastTimeHintProps) {
  const last = findLastPerformance(sessions, exerciseId, date)
  if (!last) return null

  return (
    <div className="flex items-center gap-2.5 rounded-[18px] bg-accent-soft py-2.5 pr-2.5 pl-3.5 text-[13px] font-semibold text-accent-ink">
      <RefreshIcon size={15} className="shrink-0" />
      <span className="min-w-0 flex-1">
        Last time <b className="font-extrabold">{formatDate(last.date)}</b>: {formatSets(last.sets)}
      </span>
      <button
        type="button"
        onClick={() => onUse(last.sets.map(({ reps, weight, unit }) => ({ reps, weight, unit })))}
        className="h-9 shrink-0 rounded-full bg-accent px-4 text-xs font-bold text-white transition-colors hover:bg-accent-hover"
      >
        Use
      </button>
    </div>
  )
}

export function CardioLastTimeHint({ sessions, exerciseId, date, onUse }: Omit<LastTimeHintProps, 'onUse'> & {
  onUse: (cardio: CardioLog) => void
}) {
  const last = findLastCardio(sessions, exerciseId, date)
  if (!last) return null
  return (
    <div className="flex items-center gap-2.5 rounded-[18px] bg-accent-soft py-2.5 pr-2.5 pl-3.5 text-[13px] font-semibold text-accent-ink">
      <RefreshIcon size={15} className="shrink-0" />
      <span className="min-w-0 flex-1">
        Last time <b className="font-extrabold">{formatDate(last.date)}</b>: {last.cardio.intervals.map((interval) => formatCardioInterval(copyCardioInterval(interval), last.cardio.tracking)).join(' / ')}
      </span>
      <button type="button" onClick={() => onUse({ ...last.cardio, intervals: last.cardio.intervals.map(copyCardioInterval) })}
        className="h-9 shrink-0 rounded-full bg-accent px-4 text-xs font-bold text-white transition-colors hover:bg-accent-hover">
        Use
      </button>
    </div>
  )
}
