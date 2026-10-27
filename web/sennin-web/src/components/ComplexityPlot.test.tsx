import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ComplexityPlot } from './ComplexityPlot'

const points = [
  { n: 1_000, ms: 1.1 },
  { n: 10_000, ms: 96 },
  { n: 100_000, ms: 9_300 },
]

describe('ComplexityPlot', () => {
  it('summarises the fit and the target in its caption', () => {
    render(
      <ComplexityPlot
        points={points}
        fit={{ exponent: 1.97, r2: 0.99 }}
        target={{ label: 'n log n', exponent: 1.1 }}
      />,
    )
    expect(screen.getByRole('figure')).toHaveAccessibleName(/n\^1\.97.*0\.99.*n log n/)
  })

  it('draws one marker per measured point', () => {
    const { container } = render(
      <ComplexityPlot
        points={points}
        fit={{ exponent: 1.97, r2: 0.99 }}
        target={{ label: 'n', exponent: 1 }}
      />,
    )
    expect(container.querySelectorAll('[data-point]')).toHaveLength(3)
  })

  it('offers the points as a table for screen readers', () => {
    render(
      <ComplexityPlot
        points={points}
        fit={{ exponent: 1.97, r2: 0.99 }}
        target={{ label: 'n', exponent: 1 }}
      />,
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(4)
  })

  it('says why when the probe was skipped', () => {
    render(<ComplexityPlot skipped="Skipped because 3 hidden tests failed." />)
    expect(screen.getByText('Skipped because 3 hidden tests failed.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
