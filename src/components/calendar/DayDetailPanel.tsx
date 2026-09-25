import { Link } from 'react-router-dom'
import { useExercises } from '../../exercises/ExerciseContext'
import { useConfirm } from '../../hooks/useConfirm'
import type { WorkoutSession } from '../../types'
import { CheckIcon, ClockIcon, PlusIcon, TrashIcon } from '../icons'
import { btnSoftSmClass, cardClass, cardTitleClass } from '../ui'

interface DayDetailPanelProps {
  date: string
  sessions: WorkoutSession[]
  onDeleteSession: (id: string) => void
}

function formatSet(set: WorkoutSession['entries'][number]['sets'][number]) {
  const base = `${set.reps} × ${set.weight} ${set.unit}`
  return set.intensity ? `${base} · RPE ${set.intensity}` : base
}

export function DayDetailPanel({ date, sessions, onDeleteSession }: DayDetailPanelProps) {
  const { confirm, dialog } = useConfirm()
  const { exercisesById } = useExercises()

  return (
    <section className={`${cardClass} flex flex-col gap-4`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={cardTitleClass}>Workouts</h2>
        <Link
          to={`/log?date=${date}`}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent pr-5 pl-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover"
        >
          <PlusIcon />
          Add workout
        </Link>
      </div>

      {sessions.length === 0 && <p className="text-sm text-muted">No workouts logged for this day.</p>}

      {sessions.map((session) => (
        <article key={session.id} className="flex flex-col gap-3.5 rounded-panel bg-inset p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2.5">
            {session.status === 'planned' ? (
              <span className="flex items-center gap-1.5 rounded-full bg-warning-soft py-1 pr-3 pl-2 text-xs font-bold text-warning-ink">
                <ClockIcon size={14} />
                Planned
              </span>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-success-soft py-1 pr-3 pl-2 text-xs font-bold text-success-ink">
                <CheckIcon size={14} />
                Completed
              </span>
            )}
            {session.notes && <p className="text-[13px] text-ink-3 italic">{session.notes}</p>}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {session.status === 'planned' && (
                <Link to={`/complete/${session.id}`} className={btnSoftSmClass}>
                  <CheckIcon size={15} />
                  Mark as done
                </Link>
              )}
              <button
                onClick={async () => {
                  const names = session.entries
                    .map((e) => exercisesById[e.exerciseId]?.name ?? e.exerciseId)
                    .join(', ')
                  if (await confirm(`Delete this workout (${names || date})? This cannot be undone.`)) {
                    onDeleteSession(session.id)
                  }
                }}
                aria-label="Delete workout"
                title="Delete workout"
                className="flex size-10 items-center justify-center rounded-full bg-surface text-danger transition-colors hover:bg-danger-soft"
              >
                <TrashIcon size={17} />
              </button>
            </div>
          </div>
          <ul className="flex flex-col gap-2.5">
            {session.entries.map((entry, i) => {
              const exercise = exercisesById[entry.exerciseId]
              return (
                <li
                  key={i}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-field bg-surface px-3.5 py-3"
                >
                  <span className="text-[15px] font-bold text-ink">{exercise?.name ?? entry.exerciseId}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {entry.sets.map((set, si) => (
                      <span key={si} className="rounded-full bg-sunken px-2.5 py-1 text-xs font-semibold text-ink-2">
                        {formatSet(set)}
                      </span>
                    ))}
                  </span>
                </li>
              )
            })}
          </ul>
        </article>
      ))}
      {dialog}
    </section>
  )
}
