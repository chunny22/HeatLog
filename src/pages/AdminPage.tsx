import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Alert } from '../components/Alert'
import { RefreshIcon, TrashIcon } from '../components/icons'
import { cardClass, iconBtnDangerClass, pageClass, pageTitleClass } from '../components/ui'
import { useConfirm } from '../hooks/useConfirm'
import { supabase } from '../supabase'

interface AdminUser {
  id: string
  email: string
  createdAt: string
}

export function AdminPage() {
  const { session } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { confirm, dialog } = useConfirm()

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.functions.invoke('admin-list-users')

    if (error || data?.error) {
      setError(error?.message ?? data?.error ?? 'Failed to load users')
    } else {
      setUsers(data.users as AdminUser[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = async (user: AdminUser) => {
    if (!(await confirm(`Permanently delete ${user.email}? This cannot be undone.`))) return

    setDeletingId(user.id)
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId: user.id },
    })

    if (error || data?.error) {
      setError(error?.message ?? data?.error ?? 'Failed to delete user')
    } else {
      await refresh()
    }
    setDeletingId(null)
  }

  return (
    <div className={pageClass}>
      <h1 className={pageTitleClass}>Admin — Accounts</h1>

      {loading && <p className="text-sm text-muted">Loading…</p>}
      {error && <Alert tone="error">{error}</Alert>}

      {!loading && !error && (
        <section className={`${cardClass} overflow-x-auto p-2 sm:p-3`}>
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => {
                const isSelf = user.id === session?.user.id
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {user.email}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-ink">
                          you
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          aria-label={`Delete ${user.email}`}
                          title="Delete account"
                          className={`${iconBtnDangerClass} ml-auto`}
                        >
                          {deletingId === user.id ? <RefreshIcon size={16} className="animate-spin" /> : <TrashIcon size={17} />}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}
      {dialog}
    </div>
  )
}
