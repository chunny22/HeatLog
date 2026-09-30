import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { buildMonthGrid, MONTH_NAMES, todayISO, toISODate, WEEKDAY_LABELS } from '../../utils/date'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons'
import { fieldClass, iconBtnSmClass, labelClass } from '../ui'

interface WorkoutDatePickerProps {
  label: string
  value: string
  disabled?: boolean
  onChange: (date: string) => void
}

const readableDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric',
})

export function WorkoutDatePicker({ label, value, disabled, onChange }: WorkoutDatePickerProps) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const focusedDay = useRef<HTMLButtonElement>(null)
  const focusOnDay = useRef(false)
  const [open, setOpen] = useState(false)
  const [cursor, setCursor] = useState(value)
  const monthDate = new Date(`${cursor}T12:00:00`)
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const today = todayISO()

  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  useEffect(() => {
    if (open && focusOnDay.current) {
      focusedDay.current?.focus()
      focusOnDay.current = false
    }
  }, [open, cursor])

  const close = () => {
    setOpen(false)
    trigger.current?.focus()
  }

  const select = (date: string) => {
    onChange(date)
    close()
  }

  const shiftMonth = (amount: number, focus = false) => {
    const date = new Date(`${cursor}T12:00:00`)
    const day = date.getDate()
    date.setDate(1)
    date.setMonth(date.getMonth() + amount)
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    date.setDate(Math.min(day, lastDay))
    if (date.getFullYear() < 1000 || date.getFullYear() > 9999) return
    focusOnDay.current = focus
    setCursor(toISODate(date))
  }

  const navigateDay = (event: KeyboardEvent<HTMLButtonElement>) => {
    const date = new Date(`${cursor}T12:00:00`)
    const offsets: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
      Home: -date.getDay(), End: 6 - date.getDay(),
    }
    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault()
      shiftMonth(event.key === 'PageUp' ? -1 : 1, true)
    } else if (event.key in offsets) {
      event.preventDefault()
      date.setDate(date.getDate() + offsets[event.key])
      if (date.getFullYear() < 1000 || date.getFullYear() > 9999) return
      focusOnDay.current = true
      setCursor(toISODate(date))
    }
  }

  return (
    <div ref={root} className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
      }}>
      <label htmlFor={`${id}-trigger`} className={`${labelClass} mb-2`}>{label}</label>
      <button ref={trigger} id={`${id}-trigger`} type="button" autoFocus disabled={disabled}
        aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? `${id}-calendar` : undefined}
        onClick={() => {
          if (open) { setOpen(false); return }
          setCursor(value)
          focusOnDay.current = true
          setOpen(true)
        }}
        className={`${fieldClass} flex items-center justify-between gap-3 text-left disabled:opacity-60`}>
        <span>{readableDate(value)}</span>
        <CalendarIcon size={18} className="shrink-0 text-accent" />
      </button>
      {open && !disabled && (
        <div id={`${id}-calendar`} role="dialog" aria-label={label}
          className="absolute right-0 bottom-full z-30 mb-2 max-h-[calc(100dvh-2rem)] w-full max-w-80 overflow-y-auto rounded-panel border border-line bg-popover p-3 shadow-pop sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 aria-live="polite" className="text-sm font-bold text-ink">{MONTH_NAMES[month]} {year}</h3>
            <div className="flex gap-1">
              <button type="button" aria-label="Previous month" className={iconBtnSmClass}
                disabled={year === 1000 && month === 0} onClick={() => shiftMonth(-1)}><ChevronLeftIcon size={16} /></button>
              <button type="button" aria-label="Next month" className={iconBtnSmClass}
                disabled={year === 9999 && month === 11} onClick={() => shiftMonth(1)}><ChevronRightIcon size={16} /></button>
            </div>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-bold tracking-wide text-muted uppercase" aria-hidden="true">
            {WEEKDAY_LABELS.map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1" role="group" aria-label="Choose a date">
            {buildMonthGrid(year, month).map((day) => (
              <button key={day.iso} ref={day.iso === cursor ? focusedDay : undefined} type="button"
                tabIndex={day.iso === cursor ? 0 : -1} aria-label={readableDate(day.iso)}
                aria-pressed={day.iso === value} aria-current={day.iso === today ? 'date' : undefined}
                disabled={day.date.getFullYear() < 1000 || day.date.getFullYear() > 9999}
                onKeyDown={navigateDay} onClick={() => select(day.iso)}
                className={`flex aspect-square items-center justify-center rounded-full text-[13px] transition-colors disabled:opacity-30 ${
                  day.iso === value ? 'bg-accent font-bold text-white' :
                    day.iso === today ? 'bg-accent-soft font-bold text-accent-ink hover:brightness-95' :
                      day.inCurrentMonth ? 'font-medium text-ink-2 hover:bg-sunken' : 'text-faint hover:bg-sunken'
                }`}>
                {day.date.getDate()}
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-line pt-2">
            <button type="button" onClick={() => select(today)}
              className="w-full rounded-full py-2 text-xs font-bold text-accent-ink transition-colors hover:bg-accent-soft">Today</button>
          </div>
        </div>
      )}
    </div>
  )
}
