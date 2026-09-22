import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-page text-sm font-medium text-muted">Loading…</div>
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
