import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { defaultCopy } from '../copy/copy'
import { EvidenceChip } from './EvidenceChip'
import { FindingNote } from './FindingNote'

describe('FindingNote', () => {
  it('is an article titled by the finding, with its severity in words', () => {
    render(
      <FindingNote severity="major" title="Empty input is not handled">
        Line 3 reads the first element before checking the length.
      </FindingNote>,
    )
    const note = screen.getByRole('article', { name: 'Empty input is not handled' })
    expect(within(note).getByText(defaultCopy.severity.major)).toBeInTheDocument()
  })

  it('lists its evidence chips', () => {
    render(
      <FindingNote
        severity="minor"
        title="Quadratic scan"
        evidence={<EvidenceChip kind="probe" label="probe n=10^5" target="probe-5" />}
      >
        The inner loop runs over the whole array again.
      </FindingNote>,
    )
    expect(screen.getByRole('button', { name: 'Show probe n=10^5' })).toBeInTheDocument()
  })

  it('carries severity for weight styling', () => {
    render(<FindingNote severity="nit" title="Name the constant" />)
    expect(screen.getByRole('article')).toHaveAttribute('data-severity', 'nit')
  })
})

describe('FindingNote critical', () => {
  it('renders the top severity in words', () => {
    render(<FindingNote severity="critical" title="Reads outside the array" />)
    const note = screen.getByRole('article', { name: 'Reads outside the array' })
    expect(note).toHaveAttribute('data-severity', 'critical')
    expect(within(note).getByText(defaultCopy.severity.critical)).toBeInTheDocument()
  })
})
