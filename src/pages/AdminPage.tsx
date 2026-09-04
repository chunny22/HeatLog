import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
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
    if (!window.confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return

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
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Admin — Accounts</h1>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const isSelf = user.id === session?.user.id
                return (
                  <tr key={user.id}>
                    <td className="px-4 py-2 text-gray-800">
                      {user.email}
                      {isSelf && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                    </td>
                    <td className="px-4 py-2 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          {deletingId === user.id ? 'Deleting…' : 'Delete'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
