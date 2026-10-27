import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BackendProvider } from '../api/context'
import { createMockApi, createMockStream, type DemoState } from '../api/mock'
import { useLiveVerdict } from './useLiveVerdict'

const calm: DemoState = {
  judgePaused: false,
  reviewerDown: false,
  newAccount: false,
  offline: false,
}

describe('useLiveVerdict', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts queued with every case pending, resolves in order, then grades and reviews', async () => {
    const api = createMockApi(() => calm)
    const stream = createMockStream(api, () => calm)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <BackendProvider backend={{ api, stream }}>{children}</BackendProvider>
    )
    const pending = api.submit('ledger-reconciliation', 'python', 'return missing[:-1]')
    await vi.runOnlyPendingTimersAsync()
    const { submissionId } = await pending
    const { result } = renderHook(() => useLiveVerdict(submissionId, 12), { wrapper })
    expect(result.current.phase).toBe('queued')
    expect(result.current.cases.every((c) => c === null)).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(900)
    })
    expect(result.current.phase).toBe('running')
    const resolved = result.current.cases.filter((c) => c !== null).length
    expect(resolved).toBeGreaterThan(0)
    expect(result.current.cases.slice(0, resolved).every((c) => c !== null)).toBe(true)

    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.phase).toBe('reviewed')
    // The sheet fetches grade and findings only after the server announces them.
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.submission?.id).toBe(submissionId)
  })
})
