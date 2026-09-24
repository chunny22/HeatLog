import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CalendarIcon, DumbbellIcon, PlusIcon, TrendIcon } from './icons'
import { ProfileMenu } from './ProfileMenu'
import { ThemeMenu } from './ThemeMenu'

const links = [
  { to: '/', label: 'Calendar', shortLabel: 'Calendar', Icon: CalendarIcon },
  { to: '/log', label: 'Log Workout', shortLabel: 'Log', Icon: PlusIcon },
  { to: '/breakdown', label: 'Progress', shortLabel: 'Progress', Icon: TrendIcon },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative z-10 flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors sm:px-[18px] ${
    isActive ? 'text-white' : 'text-ink-3 hover:bg-sunken hover:text-ink'
  }`

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative z-10 flex flex-1 flex-col items-center gap-1 py-1.5 text-[11px] font-bold transition-colors ${
    isActive ? 'text-accent-ink' : 'text-muted'
  }`

type Highlight = { left: number; width: number } | null

// Measures the active link (or a part of it) so a highlight can slide to it.
// getBoundingClientRect gives fractional (sub-pixel) coordinates, unlike
// offsetLeft/offsetWidth which each round to whole pixels independently; using
// integers can push the highlight's right edge past the real container width.
function useSlidingHighlight(containerRef: RefObject<HTMLElement | null>, target: string, deps: unknown[]): Highlight {
  const [highlight, setHighlight] = useState<Highlight>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const active = container?.querySelector<HTMLElement>(target)
      if (!container || !active) {
        setHighlight(null)
        return
      }
      const containerRect = container.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      const next = { left: activeRect.left - containerRect.left, width: activeRect.width }
      setHighlight((prev) => (prev && prev.left === next.left && prev.width === next.width ? prev : next))
    }

    measure()
    // Link widths depend on the web font, which can finish loading after the
    // first measurement.
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return highlight
}

export function Nav() {
  const location = useLocation()

  const linksRef = useRef<HTMLDivElement>(null)
  const highlight = useSlidingHighlight(linksRef, '[aria-current="page"]', [location.pathname])

  const tabsRef = useRef<HTMLDivElement>(null)
  const tabHighlight = useSlidingHighlight(tabsRef, '[aria-current="page"] [data-pill]', [location.pathname])

  return (
    <>
      <nav aria-label="Main" className="sticky top-0 z-30 px-4 pt-4 pb-2">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full bg-surface/95 p-2 shadow-card backdrop-blur">
          <div className="flex min-w-0 items-center gap-1">
            <span className="mr-2 flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white">
              <DumbbellIcon size={20} />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-ink sm:hidden">HeatLog</span>
            <div ref={linksRef} className="relative hidden min-w-0 gap-1 overflow-x-auto sm:flex">
              {highlight && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 left-0 z-0 h-11 rounded-full bg-accent transition-[transform,width] duration-300 ease-out"
                  style={{ width: highlight.width, transform: `translateX(${highlight.left}px)` }}
                />
              )}
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <ThemeMenu />
            <ProfileMenu />
          </div>
        </div>
      </nav>

      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-30 rounded-t-[28px] bg-surface/95 px-3 pt-2 pb-[max(env(safe-area-inset-bottom),12px)] shadow-bar backdrop-blur sm:hidden"
      >
        <div ref={tabsRef} className="relative mx-auto flex max-w-md">
          {tabHighlight && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 left-0 z-0 h-[30px] rounded-full bg-accent-soft transition-[transform,width] duration-300 ease-out"
              style={{ width: tabHighlight.width, transform: `translateX(${tabHighlight.left}px)` }}
            />
          )}
          {links.map(({ to, shortLabel, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={mobileLinkClass}>
              <span data-pill className="flex h-[30px] w-14 items-center justify-center">
                <Icon size={21} />
              </span>
              {shortLabel}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
