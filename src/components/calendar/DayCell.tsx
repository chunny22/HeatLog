import type { MonthGridDay } from '../../utils/date'

interface DayCellProps {
  day: MonthGridDay
  hasWorkout: boolean
  isToday: boolean
  onClick: () => void
}

export function DayCell({ day, hasWorkout, isToday, onClick }: DayCellProps) {
  return (
    <button
      onClick={onClick}
      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-sm transition-colors ${
        isToday ? 'border-indigo-300 bg-indigo-50 text-gray-900' : 'border-transparent hover:bg-gray-100'
      } ${!day.inCurrentMonth ? 'text-gray-300' : 'text-gray-700'}`}
    >
      <span>{day.date.getDate()}</span>
      {hasWorkout && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />}
    </button>
  )
}
