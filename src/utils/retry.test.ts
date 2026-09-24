import { afterEach, describe, expect, it, vi } from 'vitest'
import { retryWhile } from './retry'

afterEach(() => {
  vi.useRealTimers()
})

type Result = { error: string | null }
const failed = (r: Result) => Boolean(r.error)

describe('retryWhile', () => {
  it('returns immediately when the first attempt succeeds', async () => {
    const fn = vi.fn<() => Promise<Result>>().mockResolvedValue({ error: null })
    const result = await retryWhile(fn, failed, [100, 200])
    expect(result).toEqual({ error: null })
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries after each delay until it succeeds', async () => {
    vi.useFakeTimers()
    const fn = vi
      .fn<() => Promise<Result>>()
      .mockResolvedValueOnce({ error: 'JWT issued at future' })
      .mockResolvedValueOnce({ error: 'JWT issued at future' })
      .mockResolvedValueOnce({ error: null })
    const promise = retryWhile(fn, failed, [100, 200, 400])

    await vi.advanceTimersByTimeAsync(99)
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(200)
    expect(fn).toHaveBeenCalledTimes(3)

    await expect(promise).resolves.toEqual({ error: null })
  })

  it('gives up after the last delay and returns the final failure', async () => {
    vi.useFakeTimers()
    const fn = vi.fn<() => Promise<Result>>().mockResolvedValue({ error: 'still failing' })
    const promise = retryWhile(fn, failed, [100, 200])
    await vi.advanceTimersByTimeAsync(1000)

    await expect(promise).resolves.toEqual({ error: 'still failing' })
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
