import type { MonthGridDay } from '../../utils/date'

interface DayCellProps {
  day: MonthGridDay
  hasWorkout: boolean
  isToday: boolean
  onClick: () => void
}

export function DayCell({ day, hasWorkout, isToday, onClick }: DayCellProps) {
  let tone = 'font-medium text-ink-2 hover:bg-sunken'
  if (!day.inCurrentMonth) tone = 'font-medium text-faint hover:bg-sunken'
  if (hasWorkout) tone = 'font-bold bg-accent-soft text-accent-ink hover:brightness-95'
  if (isToday) tone = 'font-bold bg-accent text-white'

  const dot = isToday ? 'bg-white' : 'bg-accent'

  return (
    <div className="flex justify-center">
      <button
        onClick={onClick}
        aria-label={`${day.date.toDateString()}${hasWorkout ? ', workout logged' : ''}`}
        aria-current={isToday ? 'date' : undefined}
        className={`flex aspect-square w-full max-w-[54px] flex-col items-center justify-center gap-[3px] rounded-full text-[15px] transition-colors ${tone}`}
      >
        <span>{day.date.getDate()}</span>
        <span className={`size-[5px] rounded-full ${hasWorkout ? dot : 'bg-transparent'}`} />
      </button>
    </div>
  )
}
