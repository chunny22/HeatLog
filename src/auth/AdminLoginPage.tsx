import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert } from '../components/Alert'
import { LockIcon } from '../components/icons'
import { btnPrimaryClass, fieldClass, labelClass } from '../components/ui'
import { useAuth } from './AuthContext'

export function AdminLoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (session && session.user.email === import.meta.env.VITE_ADMIN_EMAIL) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await signIn(import.meta.env.VITE_ADMIN_EMAIL, password)

    if (result.error) {
      setError(result.error)
      setSubmitting(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-12">
      <div className="flex w-full max-w-[420px] flex-col gap-6 rounded-[32px] bg-surface p-6 shadow-card sm:p-9">
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className="flex size-[60px] items-center justify-center rounded-full bg-ink text-page">
            <LockIcon size={24} />
          </span>
          <div>
            <h1 className="mb-1.5 text-[26px] font-extrabold tracking-tight text-ink">Admin</h1>
            <p className="text-sm text-ink-3">Enter the admin password to continue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <label className={labelClass}>
            Password
            <input
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={fieldClass}
            />
          </label>

          {error && <Alert tone="error">{error}</Alert>}

          <button type="submit" disabled={submitting} className={`${btnPrimaryClass} mt-2.5 h-[54px] text-base`}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
