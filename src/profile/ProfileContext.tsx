import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../supabase'
import type { Profile } from '../types'
import { retryWhile } from '../utils/retry'

interface ProfileRow {
  id: string
  first_name: string
  last_name: string
  weight: number
  weight_unit: Profile['weightUnit']
  unit_preference: Profile['unitPreference']
  height: number
  height_unit: Profile['heightUnit']
  goals: Profile['goals']
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    weight: row.weight,
    weightUnit: row.weight_unit,
    unitPreference: row.unit_preference,
    height: row.height,
    heightUnit: row.height_unit,
    goals: row.goals,
  }
}

interface ProfileContextValue {
  profile: Profile | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  updateProfile: (patch: Partial<Omit<Profile, 'id'>>) => Promise<string | null>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

// One shared copy of the signed-in user's profile, so the menu, workout form,
// charts and Profile page all see the same data (and edits show up everywhere).
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id ?? null
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    // Right after sign-in Supabase can briefly reject the new token ("JWT issued
    // at future" -- its servers' clocks are a moment apart), so retry a few times
    // instead of showing a permanent error.
    const { data, error } = await retryWhile(
      async () =>
        supabase
          .from('profiles')
          .select('id, first_name, last_name, weight, weight_unit, unit_preference, height, height_unit, goals')
          .single(),
      (result) => Boolean(result.error),
      [800, 1600, 3200],
    )

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setProfile(rowToProfile(data as ProfileRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setError(null)
      setLoading(false)
      return
    }
    refresh()
  }, [userId, refresh])

  const updateProfile = useCallback(
    async (patch: Partial<Omit<Profile, 'id'>>): Promise<string | null> => {
      if (!profile) return 'Profile not loaded.'
      const row: Record<string, unknown> = {}
      if (patch.firstName !== undefined) row.first_name = patch.firstName
      if (patch.lastName !== undefined) row.last_name = patch.lastName
      if (patch.weight !== undefined) row.weight = patch.weight
      if (patch.weightUnit !== undefined) row.weight_unit = patch.weightUnit
      if (patch.unitPreference !== undefined) row.unit_preference = patch.unitPreference
      if (patch.height !== undefined) row.height = patch.height
      if (patch.heightUnit !== undefined) row.height_unit = patch.heightUnit
      if (patch.goals !== undefined) row.goals = patch.goals

      // Apply immediately so toggles feel instant; roll back if the save fails.
      const previous = profile
      setProfile({ ...profile, ...patch })
      const { error } = await supabase.from('profiles').update(row).eq('id', profile.id)
      if (error) {
        setProfile(previous)
        return error.message
      }
      return null
    },
    [profile],
  )

  const value = useMemo(
    () => ({ profile, loading, error, refresh, updateProfile }),
    [profile, loading, error, refresh, updateProfile],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>')
  return ctx
}
