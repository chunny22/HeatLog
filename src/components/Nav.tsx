import { NavLink } from 'react-router-dom'
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
  `flex h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors sm:px-[18px] ${
    isActive ? 'bg-accent text-white' : 'text-ink-3 hover:bg-sunken hover:text-ink'
  }`

export function Nav() {
  const { session, signOut } = useAuth()
  const isAdmin = session?.user.email === import.meta.env.VITE_ADMIN_EMAIL

  return (
    <nav className="sticky top-0 z-30 px-4 pt-4 pb-2">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full bg-surface/95 p-2 shadow-card backdrop-blur">
        <div className="flex min-w-0 items-center gap-1">
          <span className="mr-2 hidden size-11 shrink-0 items-center justify-center rounded-full bg-accent text-white sm:flex">
            <DumbbellIcon size={20} />
          </span>
          <div className="flex min-w-0 gap-1 overflow-x-auto">
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
