import { useEffect, useRef, useState } from 'react'
import { useTheme, type ThemePreference } from '../theme/ThemeContext'
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from './icons'
import { iconBtnClass } from './ui'

const OPTIONS: { value: ThemePreference; label: string; hint?: string; Icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light', Icon: SunIcon },
  { value: 'dark', label: 'Dark', Icon: MoonIcon },
  { value: 'system', label: 'System', hint: 'Match this device', Icon: MonitorIcon },
]

export function ThemeMenu() {
  const { preference, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[2]

  useEffect(() => {
    if (!open) return
    const handlePointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Theme: ${current.label}`}
        title="Theme"
        aria-haspopup="menu"
        aria-expanded={open}
        className={iconBtnClass}
      >
        <current.Icon />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme"
          className="absolute top-[60px] right-0 z-40 flex w-58 flex-col gap-0.5 rounded-panel bg-popover p-1.5 shadow-pop"
        >
          <div className="px-3 pt-2 pb-1.5 text-xs font-bold tracking-[0.06em] text-muted uppercase">Theme</div>
          {OPTIONS.map(({ value, label, hint, Icon }) => {
            const selected = value === preference
            return (
              <button
                key={value}
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setPreference(value)
                  setOpen(false)
                }}
                className={`flex min-h-12 items-center gap-3 rounded-field px-3 py-2 text-left text-sm font-semibold text-ink transition-colors ${
                  selected ? 'bg-sunken' : 'hover:bg-sunken'
                }`}
              >
                <Icon className="text-ink-3" />
                <span className="flex flex-col">
                  {label}
                  {hint && <span className="text-xs font-medium text-muted">{hint}</span>}
                </span>
                {selected && <CheckIcon strokeWidth={2.5} className="ml-auto text-accent" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
