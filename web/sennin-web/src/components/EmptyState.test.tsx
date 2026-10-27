import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('names the empty place and offers the next step', () => {
    render(
      <EmptyState
        icon="history"
        title="No submissions yet"
        action={<Button>Open the library</Button>}
      >
        Your graded submissions appear here, newest first.
      </EmptyState>,
    )
    expect(screen.getByRole('heading', { name: 'No submissions yet' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open the library' })).toBeInTheDocument()
  })
})
