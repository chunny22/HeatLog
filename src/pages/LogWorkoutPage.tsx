import { useSearchParams } from 'react-router-dom'
import { pageClass, pageTitleClass } from '../components/ui'
import { WorkoutForm } from '../components/workout/WorkoutForm'
import { useSessions } from '../hooks/useSessions'
import { todayISO } from '../utils/date'

export function LogWorkoutPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const date = searchParams.get('date') ?? todayISO()
  const { addSession } = useSessions()

  return (
    <div className={pageClass}>
      <h1 className={pageTitleClass}>Log Workout</h1>
      <WorkoutForm
        date={date}
        onDateChange={(newDate) => setSearchParams({ date: newDate })}
        onSave={(entries, status, notes) => addSession(date, entries, status, notes)}
      />
    </div>
  )
}
