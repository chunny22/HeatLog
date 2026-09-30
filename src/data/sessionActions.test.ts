import { beforeEach, describe, expect, it, vi } from 'vitest'
const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('../supabase', () => ({ supabase: { from } }))
import { duplicateWorkout, moveWorkout, type SessionRow } from './sessionActions'

const source: SessionRow = {
  id: 'original', date: '2026-09-27', status: 'completed', notes: 'Keep these notes',
  entries: [{ exerciseId: 'custom-run', sets: [], cardio: { tracking: 'distance', intervals: [{ durationMinutes: 30, distance: 5, distanceUnit: 'km', intensity: 8 }] } }],
}

function query(result: { data: SessionRow | null; error: { message: string } | null }) {
  const chain = { update: vi.fn(), insert: vi.fn(), select: vi.fn(), eq: vi.fn(), single: vi.fn().mockResolvedValue(result) }
  for (const name of ['update', 'insert', 'select', 'eq'] as const) chain[name].mockReturnValue(chain)
  return chain
}

beforeEach(() => from.mockReset())

describe('moveWorkout', () => {
  it('updates only the date on the selected workout and returns the saved record', async () => {
    const saved = { ...source, date: '2026-09-28' }
    const chain = query({ data: saved, error: null })
    from.mockReturnValue(chain)
    expect(await moveWorkout(source.id, saved.date)).toEqual({ error: null, session: saved })
    expect(chain.update).toHaveBeenCalledExactlyOnceWith({ date: saved.date })
    expect(chain.eq).toHaveBeenCalledExactlyOnceWith('id', source.id)
    expect(chain.insert).not.toHaveBeenCalled()
    expect(chain.single).toHaveBeenCalledOnce()
  })

  it('reports a rejected or missing workout instead of returning success', async () => {
    from.mockReturnValue(query({ data: null, error: { message: 'Workout not found' } }))
    expect(await moveWorkout('missing', '2026-09-28')).toEqual({ error: 'Workout not found' })
  })
})

describe('duplicateWorkout', () => {
  it('reads the selected workout and inserts an independent plan with default ownership', async () => {
    const read = query({ data: source, error: null })
    const write = query({ data: { ...source, id: 'new', date: '2026-09-28', status: 'planned' }, error: null })
    from.mockReturnValueOnce(read).mockReturnValueOnce(write)
    const result = await duplicateWorkout(source.id, '2026-09-28')
    expect(result.session?.id).toBe('new')
    expect(read.eq).toHaveBeenCalledExactlyOnceWith('id', source.id)
    const payload = write.insert.mock.calls[0][0]
    expect(payload).toMatchObject({ date: '2026-09-28', status: 'planned', notes: source.notes })
    expect(payload).not.toHaveProperty('id')
    expect(payload).not.toHaveProperty('user_id')
    expect(payload.entries[0].cardio.intervals[0]).toEqual({ durationMinutes: 30, distance: 5, distanceUnit: 'km' })
    expect(read.update).not.toHaveBeenCalled()
    expect(write.update).not.toHaveBeenCalled()
  })

  it('does not insert if the source cannot be read', async () => {
    from.mockReturnValue(query({ data: null, error: { message: 'Not found' } }))
    expect(await duplicateWorkout('missing', '2026-09-28')).toEqual({ error: 'Not found' })
    expect(from).toHaveBeenCalledOnce()
  })

  it('surfaces insert failures and does not retry a potentially committed request', async () => {
    from.mockReturnValueOnce(query({ data: source, error: null }))
      .mockReturnValueOnce(query({ data: null, error: { message: 'Save failed' } }))
    expect(await duplicateWorkout(source.id, '2026-09-28')).toEqual({ error: 'Save failed' })
    expect(from).toHaveBeenCalledTimes(2)
  })
})

it('rejects invalid dates before making requests', async () => {
  expect((await moveWorkout('original', '2026-02-30')).error).toBeTruthy()
  expect((await duplicateWorkout('original', '')).error).toBeTruthy()
  expect(from).not.toHaveBeenCalled()
})
