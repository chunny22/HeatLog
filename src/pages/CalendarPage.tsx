import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarGrid } from '../components/calendar/CalendarGrid'
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
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Calendar</h1>
      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
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
