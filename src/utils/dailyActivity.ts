import type { WorkoutSession } from '../types'
import { toISODate } from './date'
import { setVolume } from './muscleVolume'

export interface DayVolume {
  date: string
  volume: number
}

/** One entry per day for the trailing `days` days (today inclusive), oldest first. */
export function computeDailyVolume(sessions: WorkoutSession[], days: number): DayVolume[] {
  const volumeByDate = new Map<string, number>()

  for (const session of sessions) {
    if (session.status !== 'completed') continue

    const sessionVolume = session.entries.reduce(
      (sum, entry) => sum + entry.sets.reduce((s, set) => s + setVolume(set.reps, set.weight), 0),
      0,
    )
    volumeByDate.set(session.date, (volumeByDate.get(session.date) ?? 0) + sessionVolume)
  }

  const today = new Date()
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (days - 1 - i))
    const iso = toISODate(date)
    return { date: iso, volume: volumeByDate.get(iso) ?? 0 }
  })
}

/** Most/least active among days that actually had volume > 0 -- rest days don't count. */
export function findMostActiveDay(series: DayVolume[]): DayVolume | null {
  const active = series.filter((d) => d.volume > 0)
  if (active.length === 0) return null
  return active.reduce((max, d) => (d.volume > max.volume ? d : max))
}

export function findLeastActiveDay(series: DayVolume[]): DayVolume | null {
  const active = series.filter((d) => d.volume > 0)
  if (active.length === 0) return null
  return active.reduce((min, d) => (d.volume < min.volume ? d : min))
}
