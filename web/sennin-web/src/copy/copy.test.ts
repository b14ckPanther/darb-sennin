import { describe, expect, it } from 'vitest'
import { defaultCopy, fill } from './copy'

describe('copy', () => {
  it('loads interface copy from config', () => {
    expect(defaultCopy.verdict.pass.length).toBeGreaterThan(0)
  })

  it('fills placeholders and leaves unknown ones visible', () => {
    expect(fill('Case {n} of {total}', { n: 7 })).toBe('Case 7 of {total}')
  })

  it('has no exclamation marks anywhere', () => {
    expect(JSON.stringify(defaultCopy)).not.toContain('!')
  })
})
