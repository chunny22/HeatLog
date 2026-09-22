import { Link } from 'react-router-dom'
import { EXERCISES_BY_ID } from '../../data/exercises'
import { useConfirm } from '../../hooks/useConfirm'
import type { WorkoutSession } from '../../types'

interface DayDetailPanelProps {
  date: string
  sessions: WorkoutSession[]
  onDeleteSession: (id: string) => void
}

function formatSet(set: WorkoutSession['entries'][number]['sets'][number]) {
  const base = `${set.reps}×${set.weight}${set.unit}`
  return set.intensity ? `${base} @RPE${set.intensity}` : base
}

export function DayDetailPanel({ date, sessions, onDeleteSession }: DayDetailPanelProps) {
  const { confirm, dialog } = useConfirm()

  return (
    <div className="mt-4 rounded-xl border border-gray-200 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{date}</h3>
        <Link
          to={`/log?date=${date}`}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
        >
          + Add workout
        </Link>
      </div>

      {sessions.length === 0 && (
        <p className="text-sm text-gray-400">No workouts logged for this day.</p>
      )}

      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-lg bg-gray-50 p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  session.status === 'planned' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {session.status === 'planned' ? 'Planned' : 'Completed'}
              </span>
              {session.notes && <p className="text-xs text-gray-500 italic">{session.notes}</p>}
              <div className="ml-auto flex shrink-0 items-center gap-3">
                {session.status === 'planned' && (
                  <Link to={`/complete/${session.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                    Mark as done
                  </Link>
                )}
                <button
                  onClick={async () => {
                    const names = session.entries
                      .map((e) => EXERCISES_BY_ID[e.exerciseId]?.name ?? e.exerciseId)
                      .join(', ')
                    if (await confirm(`Delete this workout (${names || date})? This cannot be undone.`)) {
                      onDeleteSession(session.id)
                    }
                  }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <ul className="flex flex-col gap-1.5">
              {session.entries.map((entry, i) => {
                const exercise = EXERCISES_BY_ID[entry.exerciseId]
                return (
                  <li key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{exercise?.name ?? entry.exerciseId}</span>
                    <span className="text-gray-400">
                      {' — '}
                      {entry.sets.map(formatSet).join(', ')}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      {dialog}
    </div>
  )
}
