import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProfile } from '../profile/ProfileContext'
import type { WeightUnit } from '../types'
import { DumbbellIcon, LockIcon, LogOutIcon, UserIcon } from './icons'
import { SlidingSegmented } from './SlidingSegmented'

function initials(name: string | undefined, email: string | undefined): string {
  const source = name?.trim() || email?.split('@')[0] || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2)
  return letters.toUpperCase()
}

const UNIT_OPTIONS: { value: WeightUnit; label: string }[] = [
  { value: 'lb', label: 'lb' },
  { value: 'kg', label: 'kg' },
]

const itemClass =
  'flex min-h-[46px] items-center gap-3 rounded-field px-3 text-left text-sm font-semibold text-ink transition-colors hover:bg-sunken'

export function ProfileMenu() {
  const { session, signOut } = useAuth()
  const { profile, updateProfile } = useProfile()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const email = session?.user.email
  const isAdmin = email === import.meta.env.VITE_ADMIN_EMAIL
  const label = initials(`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`, email)

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
        aria-label="Profile menu"
        title="Profile"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent-ink ring-2 ring-accent transition-colors hover:brightness-95"
      >
        {label}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile"
          className="absolute top-[60px] right-0 z-40 flex w-68 flex-col gap-0.5 rounded-panel bg-popover p-1.5 shadow-pop"
        >
          <div className="flex items-center gap-3 px-3 pt-3 pb-2.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-extrabold text-accent-ink">
              {label}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold text-ink">{profile?.firstName || 'Your account'}</span>
              <span className="truncate text-xs text-muted">{email}</span>
            </span>
          </div>
          <div className="mx-2 my-1 h-px bg-line" />
          <Link to="/profile" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <UserIcon className="text-ink-3" />
            Edit profile
          </Link>
          {isAdmin && (
            <Link to="/admin" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <LockIcon className="text-ink-3" />
              Admin
            </Link>
          )}
          <div className="flex min-h-[46px] items-center gap-3 px-3 text-sm font-semibold text-ink">
            <DumbbellIcon className="text-ink-3" />
            <span>Weight units</span>
            <SlidingSegmented
              kind="buttons"
              ariaLabel="Weight units"
              className="ml-auto"
              options={UNIT_OPTIONS}
              value={profile?.unitPreference ?? 'lb'}
              onChange={(unitPreference) => void updateProfile({ unitPreference })}
              optionClassName="h-[30px] w-11 text-xs font-bold"
            />
          </div>
          <div className="mx-2 my-1 h-px bg-line" />
          <button
            role="menuitem"
            onClick={signOut}
            className={`${itemClass} text-danger-ink hover:bg-danger-soft`}
          >
            <LogOutIcon />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
