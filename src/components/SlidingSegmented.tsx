import { useLayoutEffect, useRef, useState } from 'react'

interface SlidingSegmentedProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
  /** 'tabs' switches views (role=tab); 'buttons' is a toggle group (aria-pressed). */
  kind: 'tabs' | 'buttons'
  /** Size/typography for each option; must not set a background or text colour. */
  optionClassName: string
  className?: string
  /** Track background and padding; the raised pill inherits the padding as its inset. */
  trackClassName?: string
  /** Pill colour (defaults to the raised "selected" surface). */
  pillClassName?: string
}

// A segmented control whose raised "selected" pill slides to the chosen option.
// The pill is measured with getBoundingClientRect and animates width together
// with position, so its edges stay inside the track mid-slide.
export function SlidingSegmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  kind,
  optionClassName,
  className = '',
  trackClassName = 'bg-sunken p-1',
  pillClassName = 'bg-selected shadow-raised',
}: SlidingSegmentedProps<T>) {
  const trackRef = useRef<HTMLSpanElement>(null)
  const [pill, setPill] = useState<{ left: number; top: number; width: number; height: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current
      const active = track?.querySelector<HTMLElement>('[data-active="true"]')
      if (!track || !active) return
      const t = track.getBoundingClientRect()
      const a = active.getBoundingClientRect()
      const next = { left: a.left - t.left, top: a.top - t.top, width: a.width, height: a.height }
      setPill((prev) =>
        prev && prev.left === next.left && prev.top === next.top && prev.width === next.width && prev.height === next.height
          ? prev
          : next,
      )
    }

    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [value, options])

  return (
    <span
      ref={trackRef}
      role={kind === 'tabs' ? 'tablist' : 'group'}
      aria-label={ariaLabel}
      className={`relative flex rounded-full ${trackClassName} ${className}`}
    >
      {pill && (
        <span
          aria-hidden="true"
          className={`absolute top-0 left-0 z-0 rounded-full ${pillClassName} transition-[transform,width] duration-300 ease-out`}
          style={{ width: pill.width, height: pill.height, transform: `translate(${pill.left}px, ${pill.top}px)` }}
        />
      )}
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role={kind === 'tabs' ? 'tab' : undefined}
            aria-selected={kind === 'tabs' ? active : undefined}
            aria-pressed={kind === 'buttons' ? active : undefined}
            data-active={active}
            onClick={() => onChange(o.value)}
            className={`relative z-10 whitespace-nowrap rounded-full transition-colors ${optionClassName} ${
              active ? 'text-ink' : 'text-ink-3 hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </span>
  )
}
