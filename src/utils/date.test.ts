import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildMonthGrid, daysAgoISO, toISODate, todayISO } from './date'

afterEach(() => {
  vi.useRealTimers()
})

describe('toISODate', () => {
  it('uses the local calendar day, not UTC', () => {
    // 23:30 local on the 31st: toISOString() would roll to the next day in UTC+ zones.
    expect(toISODate(new Date(2026, 11, 31, 23, 30))).toBe('2026-12-31')
    // 00:30 local on the 1st: toISOString() would roll back a day in UTC- zones.
    expect(toISODate(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01')
  })

  it('zero-pads month and day', () => {
    expect(toISODate(new Date(2026, 2, 5))).toBe('2026-03-05')
  })
})

describe('todayISO / daysAgoISO', () => {
  it('follow the (mocked) local clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 1, 12, 0))
    expect(todayISO()).toBe('2026-03-01')
    expect(daysAgoISO(0)).toBe('2026-03-01')
    expect(daysAgoISO(1)).toBe('2026-02-28')
    expect(daysAgoISO(365)).toBe('2025-03-01')
  })

  it('counts whole calendar days across a daylight-saving change', () => {
    vi.useFakeTimers()
    // US clocks spring forward on 2026-03-08.
    vi.setSystemTime(new Date(2026, 2, 9, 12, 0))
    expect(daysAgoISO(1)).toBe('2026-03-08')
    expect(daysAgoISO(2)).toBe('2026-03-07')
  })
})

describe('buildMonthGrid', () => {
  it('always returns 42 consecutive days starting on a Sunday', () => {
    for (const [year, month] of [
      [2026, 1], // Feb 2026 starts on a Sunday
      [2026, 8], // Sep 2026
      [2024, 1], // leap year February
      [2026, 11],
    ]) {
      const grid = buildMonthGrid(year, month)
      expect(grid).toHaveLength(42)
      expect(grid[0].date.getDay()).toBe(0)
      for (let i = 1; i < grid.length; i++) {
        const prev = new Date(grid[i - 1].date)
        prev.setDate(prev.getDate() + 1)
        expect(grid[i].iso).toBe(toISODate(prev))
      }
    }
  })

  it('flags only days of the requested month as in-month', () => {
    const grid = buildMonthGrid(2026, 8)
    expect(grid.filter((d) => d.inCurrentMonth)).toHaveLength(30)
    expect(grid.find((d) => d.iso === '2026-09-01')?.inCurrentMonth).toBe(true)
    expect(grid.find((d) => d.iso === '2026-10-01')?.inCurrentMonth).toBe(false)
  })
})
