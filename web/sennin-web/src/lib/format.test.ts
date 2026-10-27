import { describe, expect, it } from 'vitest'
import { dayKey, formatMs, formatWhen } from './format'

describe('format', () => {
  it('formats a submission time in the user zone', () => {
    expect(formatWhen('2026-10-27T19:42:00.000Z')).toBe('Tue 27 Oct, 21:42')
  })

  it('groups by the local calendar day', () => {
    expect(dayKey('2026-10-27T22:30:00.000Z')).toBe('2026-10-28')
  })

  it('formats case times', () => {
    expect(formatMs(12)).toBe('12 ms')
    expect(formatMs(2000)).toBe('2.00 s')
    expect(formatMs(null)).toBe('')
  })
})
