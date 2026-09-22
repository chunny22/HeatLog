import { buildMonthGrid, MONTH_NAMES, todayISO, WEEKDAY_LABELS } from '../../utils/date'
import type { WorkoutSession } from '../../types'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'
import { cardClass, iconBtnClass } from '../ui'
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
    <section className={`${cardClass} flex flex-col gap-5`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink">
          {MONTH_NAMES[month]} {year}
        </h2>
        <div className="flex gap-2">
          <button onClick={onPrevMonth} aria-label="Previous month" className={iconBtnClass}>
            <ChevronLeftIcon />
          </button>
          <button onClick={onNextMonth} aria-label="Next month" className={iconBtnClass}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold tracking-[0.06em] text-muted uppercase sm:gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-x-1 gap-y-2 sm:gap-x-2 sm:gap-y-2.5">
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

      <div className="flex gap-5 border-t border-line pt-4 text-[13px] text-ink-3">
        <span className="flex items-center gap-2">
          <span className="size-[18px] rounded-full bg-accent" />
          Today
        </span>
        <span className="flex items-center gap-2">
          <span className="size-[18px] rounded-full bg-accent-soft" />
          Workout logged
        </span>
      </div>
    </section>
  )
}
