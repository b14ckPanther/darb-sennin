import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defaultCopy } from '../copy/copy'
import { TestRow } from './TestRow'

describe('TestRow', () => {
  it.each([
    ['pending', defaultCopy.verdict.pending],
    ['pass', defaultCopy.verdict.pass],
    ['fail', defaultCopy.verdict.fail],
    ['limit', defaultCopy.verdict.limit],
  ] as const)('states %s in words, not colour alone', (status, word) => {
    render(<TestRow id="case-01" index={1} status={status} />)
    expect(screen.getByText(word)).toBeInTheDocument()
  })

  it('labels the case from copy', () => {
    render(<TestRow id="case-07" index={7} status="pass" />)
    expect(screen.getByText('Case 07')).toBeInTheDocument()
  })

  it('exposes its status for styling and its id as an anchor', () => {
    const { container } = render(<TestRow id="case-03" index={3} status="fail" />)
    const row = container.querySelector('#case-03')
    expect(row).toHaveAttribute('data-status', 'fail')
  })

  it('shows the time when one was measured', () => {
    render(<TestRow id="case-02" index={2} status="pass" time="41 ms" />)
    expect(screen.getByText('41 ms')).toBeInTheDocument()
  })

  it('renders evidence under a failing row', () => {
    render(
      <TestRow id="case-04" index={4} status="fail">
        <p>expected 3, got 2</p>
      </TestRow>,
    )
    expect(screen.getByText('expected 3, got 2')).toBeInTheDocument()
  })
})
