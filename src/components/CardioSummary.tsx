import { useExercises } from '../exercises/ExerciseContext'
import { MUSCLE_LABELS } from '../data/muscles'
import type { WeightUnit, WorkoutSession } from '../types'
import { cardioTotals, isCardioEntry } from '../utils/cardio'
import { cardClass, cardTitleClass } from './ui'

export function CardioSummary({ sessions, unit, showMuscles = false }: {
  sessions: WorkoutSession[]
  unit: WeightUnit
  showMuscles?: boolean
}) {
  const { exercisesById } = useExercises()
  const totals = cardioTotals(sessions)
  if (!totals.workouts) return null
  const distance = unit === 'lb' ? totals.distanceKm / 1.609344 : totals.distanceKm
  const format = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  const metrics = [
    { label: 'Duration', value: totals.minutes ? `${format(totals.minutes)} min` : 'Not recorded' },
    ...(distance ? [{ label: 'Distance', value: `${format(distance)} ${unit === 'lb' ? 'mi' : 'km'}` }] : []),
    ...(['steps', 'jumps', 'reps'] as const).filter((key) => totals[key] > 0).map((key) => ({ label: key, value: format(totals[key]) })),
  ]
  const muscles = [...new Set(sessions.filter((s) => s.status === 'completed').flatMap((s) => s.entries)
    .filter((entry) => isCardioEntry(entry, exercisesById[entry.exerciseId]))
    .flatMap((entry) => exercisesById[entry.exerciseId]?.muscles.map((m) => m.group) ?? []))]
  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <h2 className={cardTitleClass}>Cardio</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-panel bg-inset p-3">
            <dt className="text-xs font-semibold text-muted capitalize">{label}</dt>
            <dd className="mt-1 text-lg font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {showMuscles && muscles.length > 0 && <p className="text-xs text-ink-3">Muscles worked: {muscles.map((m) => MUSCLE_LABELS[m]).join(', ')}.</p>}
    </section>
  )
}
