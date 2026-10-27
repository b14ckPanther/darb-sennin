import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ScoreBreakdown } from './ScoreBreakdown'

const parts = [
  { label: 'Tests', value: 60, max: 70 },
  { label: 'Complexity', value: 0, max: 20 },
  { label: 'Review', value: -5 },
]

describe('ScoreBreakdown', () => {
  it('shows the score and its maximum', () => {
    render(<ScoreBreakdown score={55} max={100} parts={parts} />)
    expect(screen.getByText('55')).toBeInTheDocument()
    expect(screen.getByText('out of 100')).toBeInTheDocument()
  })

  it('ties the breakdown to the score so focus reveals it and screen readers hear it', () => {
    render(<ScoreBreakdown score={55} max={100} parts={parts} />)
    const score = screen.getByRole('button', { name: /55/ })
    const id = score.getAttribute('aria-describedby')
    expect(id).toBeTruthy()
    expect(document.getElementById(id ?? '')).toHaveTextContent('Tests 60/70')
    expect(document.getElementById(id ?? '')).toHaveTextContent('Review -5')
  })
})

describe('ScoreBreakdown disclosure', () => {
  it('toggles the breakdown on press and closes it on Escape', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<ScoreBreakdown score={55} max={100} parts={parts} />)
    const score = screen.getByRole('button', { name: /55/ })
    expect(score).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(score)
    expect(score).toHaveAttribute('aria-expanded', 'true')
    await userEvent.keyboard('{Escape}')
    expect(score).toHaveAttribute('aria-expanded', 'false')
  })
})
