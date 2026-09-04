import { useSearchParams } from 'react-router-dom'
import { WorkoutForm } from '../components/workout/WorkoutForm'
import { useSessions } from '../hooks/useSessions'
import { todayISO } from '../utils/date'

export function LogWorkoutPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const date = searchParams.get('date') ?? todayISO()
  const { addSession } = useSessions()

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Log Workout</h1>
      <WorkoutForm
        date={date}
        onDateChange={(newDate) => setSearchParams({ date: newDate })}
        onSave={(entries, status, notes) => addSession(date, entries, status, notes)}
      />
    </div>
  )
}
