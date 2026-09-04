import { buildMonthGrid, MONTH_NAMES, todayISO, WEEKDAY_LABELS } from '../../utils/date'
import type { WorkoutSession } from '../../types'
import { DayCell } from './DayCell'

interface CalendarGridProps {
  year: number
  month: number
  sessionsByDate: Record<string, WorkoutSession[]>
  onSelectDate: (iso: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

export function CalendarGrid({
  year,
  month,
  sessionsByDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const grid = buildMonthGrid(year, month)
  const today = todayISO()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onPrevMonth} className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          ← Prev
        </button>
        <h2 className="text-base font-semibold text-gray-900">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={onNextMonth} className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          Next →
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((day) => (
          <DayCell
            key={day.iso}
            day={day}
            hasWorkout={Boolean(sessionsByDate[day.iso]?.length)}
            isToday={day.iso === today}
            onClick={() => onSelectDate(day.iso)}
          />
        ))}
      </div>
    </div>
  )
}
