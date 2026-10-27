import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Toast, ToastRegion } from './Toast'

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('announces politely by default', () => {
    render(<ToastRegion toast={{ message: 'Submission queued.' }} onDismiss={() => undefined} />)
    expect(screen.getByRole('status')).toHaveTextContent('Submission queued.')
  })

  it('announces errors assertively', () => {
    render(
      <ToastRegion
        toast={{ message: 'The judge is unreachable.', tone: 'error' }}
        onDismiss={() => undefined}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('The judge is unreachable.')
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  it('dismisses from its button', async () => {
    const onDismiss = vi.fn()
    render(<Toast message="Saved." onDismiss={onDismiss} />)
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('dismisses itself after the given time, and not before', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<Toast message="Saved." durationMs={4000} onDismiss={onDismiss} />)
    act(() => {
      vi.advanceTimersByTime(3999)
    })
    expect(onDismiss).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(onDismiss).toHaveBeenCalledOnce()
  })
})
