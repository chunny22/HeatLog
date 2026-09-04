import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading…</div>
  }

  if (!session || session.user.email !== import.meta.env.VITE_ADMIN_EMAIL) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
