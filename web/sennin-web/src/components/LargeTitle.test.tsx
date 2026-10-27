import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LargeTitle } from './LargeTitle'

type Callback = (entries: { isIntersecting: boolean }[]) => void
let observed: Callback | undefined

beforeEach(() => {
  observed = undefined
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: Callback) {
        observed = cb
      }
      observe() {
        return undefined
      }
      disconnect() {
        return undefined
      }
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('LargeTitle', () => {
  it('renders the page title as the level-one heading', () => {
    render(<LargeTitle title="Today" />)
    expect(screen.getByRole('heading', { level: 1, name: 'Today' })).toBeInTheDocument()
  })

  it('collapses into the bar once the large title scrolls away', () => {
    const { container } = render(<LargeTitle title="Library" />)
    const bar = container.querySelector('[data-collapsed]')
    expect(bar).toHaveAttribute('data-collapsed', 'false')
    act(() => {
      observed?.([{ isIntersecting: false }])
    })
    expect(bar).toHaveAttribute('data-collapsed', 'true')
  })
})
