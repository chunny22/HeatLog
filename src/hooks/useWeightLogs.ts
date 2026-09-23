import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'
import type { WeightUnit } from '../types'

export interface WeightLog {
  id: string
  date: string
  weight: number
  unit: WeightUnit
}

/** Records a weigh-in for `date`, replacing any existing one that day. */
export async function saveWeightLog(date: string, weight: number, unit: WeightUnit): Promise<string | null> {
  const { error } = await supabase.from('weight_logs').upsert({ date, weight, unit }, { onConflict: 'user_id,date' })
  return error?.message ?? null
}

export function useWeightLogs() {
  const [logs, setLogs] = useState<WeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('weight_logs')
      .select('id, date, weight, unit')
      .order('date', { ascending: true })
    if (error) {
      setError(error.message)
    } else {
      setError(null)
      setLogs(data as WeightLog[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const addLog = useCallback(
    async (date: string, weight: number, unit: WeightUnit) => {
      const err = await saveWeightLog(date, weight, unit)
      if (err) return { error: err }
      await refresh()
      return { error: null }
    },
    [refresh],
  )

  const deleteLog = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('weight_logs').delete().eq('id', id)
      if (error) return { error: error.message }
      await refresh()
      return { error: null }
    },
    [refresh],
  )

  return { logs, loading, error, addLog, deleteLog }
}
