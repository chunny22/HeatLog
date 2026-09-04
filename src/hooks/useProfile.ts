import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { Profile } from '../types'

interface ProfileRow {
  id: string
  full_name: string
  weight: number
  weight_unit: Profile['weightUnit']
  height: number
  height_unit: Profile['heightUnit']
  goals: Profile['goals']
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
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
      .select('id, full_name, weight, weight_unit, height, height_unit, goals')
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

  return { profile, loading, error, refresh }
}
