import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const links = [
  { to: '/', label: 'Calendar' },
  { to: '/log', label: 'Log Workout' },
  { to: '/history', label: 'History' },
]

export function Nav() {
  const { session, signOut } = useAuth()
  const isAdmin = session?.user.email === import.meta.env.VITE_ADMIN_EMAIL

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 overflow-x-auto px-4 py-3">
        <div className="flex gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              Admin
            </NavLink>
          )}
        </div>
        <button
          onClick={signOut}
          className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
