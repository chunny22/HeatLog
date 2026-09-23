import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Profile } from '../types'

interface ProfileRow {
  id: string
  first_name: string
  last_name: string
  weight: number
  weight_unit: Profile['weightUnit']
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
    height: row.height,
    heightUnit: row.height_unit,
    goals: row.goals,
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, weight, weight_unit, height, height_unit, goals')
      .single()

    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setProfile(rowToProfile(data as ProfileRow))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateProfile = useCallback(
    async (patch: Partial<Omit<Profile, 'id'>>): Promise<string | null> => {
      if (!profile) return 'Profile not loaded.'
      const row: Record<string, unknown> = {}
      if (patch.firstName !== undefined) row.first_name = patch.firstName
      if (patch.lastName !== undefined) row.last_name = patch.lastName
      if (patch.weight !== undefined) row.weight = patch.weight
      if (patch.weightUnit !== undefined) row.weight_unit = patch.weightUnit
      if (patch.height !== undefined) row.height = patch.height
      if (patch.heightUnit !== undefined) row.height_unit = patch.heightUnit
      if (patch.goals !== undefined) row.goals = patch.goals

      const { error } = await supabase.from('profiles').update(row).eq('id', profile.id)
      if (error) return error.message
      setProfile({ ...profile, ...patch })
      return null
    },
    [profile],
  )

  return { profile, loading, error, refresh, updateProfile }
}
