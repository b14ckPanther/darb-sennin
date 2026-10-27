import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PraiseLine } from './PraiseLine'

describe('PraiseLine', () => {
  it('renders nothing when the gate did not pass', () => {
    const { container } = render(<PraiseLine earned={false} text="Clean." />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the line and the earned stamp when the gate passed', () => {
    render(<PraiseLine earned text="Linear after the sort, and every edge case handled." />)
    expect(
      screen.getByText('Linear after the sort, and every edge case handled.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Earned')).toBeInTheDocument()
  })
})
