import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => false,
}))

const { useReduceMotion } = await import('./motion')
const { updateSettings } = await import('./settings')

describe('useReduceMotion', () => {
  afterEach(() => {
    act(() => {
      updateSettings({ motion: 'system' })
    })
  })

  it('follows the system by default', () => {
    expect(renderHook(() => useReduceMotion()).result.current).toBe(false)
  })

  it('the Settings override wins', () => {
    const { result } = renderHook(() => useReduceMotion())
    act(() => {
      updateSettings({ motion: 'reduce' })
    })
    expect(result.current).toBe(true)
    expect(document.documentElement.dataset.motion).toBe('reduce')
  })
})
