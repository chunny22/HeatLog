import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DumbbellIcon, LogOutIcon } from './icons'
import { ThemeMenu } from './ThemeMenu'
import { iconBtnClass } from './ui'

const links = [
  { to: '/', label: 'Calendar' },
  { to: '/log', label: 'Log Workout' },
  { to: '/breakdown', label: 'Breakdown' },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `relative z-10 flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors sm:px-[18px] ${
    isActive ? 'text-white' : 'text-ink-3 hover:bg-sunken hover:text-ink'
  }`

export function Nav() {
  const { session, signOut } = useAuth()
  const isAdmin = session?.user.email === import.meta.env.VITE_ADMIN_EMAIL
  const location = useLocation()

  const linksRef = useRef<HTMLDivElement>(null)
  const [highlight, setHighlight] = useState<{ left: number; width: number } | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const container = linksRef.current
      const active = container?.querySelector<HTMLElement>('[aria-current="page"]')
      if (!container || !active) {
        setHighlight(null)
        return
      }
      // getBoundingClientRect gives fractional (sub-pixel) coordinates, unlike
      // offsetLeft/offsetWidth which each round to whole pixels independently.
      // Deriving the pill from those integers can push its right edge a pixel
      // or two past the container's real (fractional) width -- worse the
      // further right the active tab is, since the rounding compounds -- which
      // is exactly what was causing a lingering scrollbar specifically on the
      // rightmost tab. Rects avoid that: the pill's box is computed in the same
      // fractional space as the real link, so it can never exceed it.
      const containerRect = container.getBoundingClientRect()
      const activeRect = active.getBoundingClientRect()
      setHighlight({ left: activeRect.left - containerRect.left, width: activeRect.width })
    }

    measure()

    // Link widths depend on the web font, which can finish loading after this
    // first measurement -- re-measure once it's actually in so the pill doesn't
    // sit slightly off.
    document.fonts?.ready.then(measure)

    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [location.pathname, isAdmin])

  return (
    <nav className="sticky top-0 z-30 px-4 pt-4 pb-2">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full bg-surface/95 p-2 shadow-card backdrop-blur">
        <div className="flex min-w-0 items-center gap-1">
          <span className="mr-2 hidden size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white sm:flex">
            <DumbbellIcon size={20} />
          </span>
          <div ref={linksRef} className="relative flex min-w-0 gap-1 overflow-x-auto">
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
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeMenu />
          <button onClick={signOut} aria-label="Sign out" title="Sign out" className={iconBtnClass}>
            <LogOutIcon />
          </button>
        </div>
      </div>
    </nav>
  )
}
