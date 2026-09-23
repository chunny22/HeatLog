import { daysAgoISO } from './date'

export type Range = '30d' | '90d' | '1y' | 'all'

export const RANGE_OPTIONS: { value: Range; label: string; days: number | null }[] = [
  { value: '30d', label: '30d', days: 30 },
  { value: '90d', label: '90d', days: 90 },
  { value: '1y', label: '1y', days: 365 },
  { value: 'all', label: 'All', days: null },
]

export function filterByRange<T extends { date: string }>(items: T[], range: Range): T[] {
  const days = RANGE_OPTIONS.find((o) => o.value === range)?.days
  if (days == null) return items
  const cutoff = daysAgoISO(days)
  return items.filter((i) => i.date >= cutoff)
}
