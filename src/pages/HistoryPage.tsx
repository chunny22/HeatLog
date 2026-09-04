import { Link } from 'react-router-dom'
import { EXERCISES_BY_ID } from '../data/exercises'
import { useSessions } from '../hooks/useSessions'
import type { WorkoutSession } from '../types'

function formatSet(set: WorkoutSession['entries'][number]['sets'][number]) {
  const base = `${set.reps}×${set.weight}${set.unit}`
  return set.intensity ? `${base} @RPE${set.intensity}` : base
}

export function HistoryPage() {
  const { sessions, loading, error, deleteSession } = useSessions()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">History</h1>
      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && sessions.length === 0 && (
        <p className="text-sm text-gray-400">No workouts logged yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-xl border border-gray-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">{session.date}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    session.status === 'planned' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {session.status === 'planned' ? 'Planned' : 'Completed'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {session.status === 'planned' && (
                  <Link to={`/complete/${session.id}`} className="text-xs font-medium text-indigo-600 hover:underline">
                    Mark as done
                  </Link>
                )}
                <button
                  onClick={() => deleteSession(session.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            {session.notes && <p className="mb-2 text-xs text-gray-500 italic">{session.notes}</p>}
            <ul className="flex flex-col gap-1">
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
    </div>
  )
}
