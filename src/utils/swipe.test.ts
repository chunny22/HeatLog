import { describe, expect, it } from 'vitest'
import { dragDistance, shouldDismiss } from './swipe'

describe('dragDistance', () => {
  it('measures a downward drag', () => {
    expect(dragDistance(100, 160)).toBe(60)
  })

  it('ignores upward movement', () => {
    expect(dragDistance(100, 40)).toBe(0)
  })
})

describe('shouldDismiss', () => {
  it('dismisses once dragged past a third of the height', () => {
    expect(shouldDismiss(50, 120)).toBe(true) // threshold is 40
    expect(shouldDismiss(80, 300)).toBe(false) // threshold is 100
    expect(shouldDismiss(101, 300)).toBe(true)
  })

  it('never dismisses on a tiny accidental drag', () => {
    expect(shouldDismiss(30, 60)).toBe(false) // floor of 40px
  })
})
