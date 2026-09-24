import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { DumbbellIcon, LockIcon } from '../components/icons'
import { btnPrimaryClass, fieldClass, labelClass } from '../components/ui'
import { useAuth } from './AuthContext'

const MIN_LENGTH = 6

// The page a password-reset email links to. Supabase signs the user in with a
// short-lived "recovery" session from the link, which is what lets us set a
// new password here without knowing the old one.
export function ResetPasswordPage() {
  const { session, loading, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Those passwords don't match.")
      return
    }

    setSubmitting(true)
    const result = await updatePassword(password)
    setSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-page px-4 py-12">
      <div className="flex w-full max-w-[480px] flex-col gap-6 rounded-[32px] bg-surface p-6 shadow-card sm:p-9">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="flex size-[60px] items-center justify-center rounded-full bg-accent text-white">
            {session ? <LockIcon size={26} /> : <DumbbellIcon size={26} />}
          </span>
          <div>
            <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight text-ink">
              {loading ? 'One moment…' : session ? 'Choose a new password' : 'Link expired'}
            </h1>
            <p className="text-sm text-ink-3">
              {loading
                ? 'Checking your reset link.'
                : session
                  ? `At least ${MIN_LENGTH} characters. You'll be signed in afterwards.`
                  : 'This reset link is invalid or has already been used.'}
            </p>
          </div>
        </div>

        {!loading && !session && (
          <Link to="/auth" className={`${btnPrimaryClass} h-[54px] text-base`}>
            Request a new link
          </Link>
        )}

        {!loading && session && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <label className={labelClass}>
              New password
              <input
                type="password"
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Confirm password
              <input
                type="password"
                required
                minLength={MIN_LENGTH}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={fieldClass}
              />
            </label>
            {error && <Alert tone="error">{error}</Alert>}
            <button type="submit" disabled={submitting} className={`${btnPrimaryClass} mt-2.5 h-[54px] text-base`}>
              {submitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
