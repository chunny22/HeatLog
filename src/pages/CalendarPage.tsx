import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
import { pageClass, pageTitleClass } from '../components/ui'
import { useSessions } from '../hooks/useSessions'
import type { WorkoutSession } from '../types'

export function CalendarPage() {
  const { sessions, loading, error } = useSessions()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const sessionsByDate = useMemo(() => {
    const map: Record<string, WorkoutSession[]> = {}
    for (const session of sessions) {
      ;(map[session.date] ??= []).push(session)
    }
    return map
  }, [sessions])

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear(year - 1)
    } else {
      setMonth(month - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear(year + 1)
    } else {
      setMonth(month + 1)
    }
  }

  return (
    <div className={pageClass}>
      <h1 className={pageTitleClass}>Calendar</h1>
      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <Alert tone="error">{error}</Alert>}
      <CalendarGrid
        year={year}
        month={month}
        sessionsByDate={sessionsByDate}
        onSelectDate={(iso) => navigate(`/day/${iso}`)}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
      />
    </div>
  )
}
