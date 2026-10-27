import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EvidenceChip } from './EvidenceChip'

describe('EvidenceChip', () => {
  it('is a button named after the evidence it shows', () => {
    render(<EvidenceChip kind="case" label="case 07" target="case-07" />)
    expect(screen.getByRole('button', { name: 'Show case 07' })).toBeInTheDocument()
  })

  it('jumps to its target on click and on Enter', async () => {
    const onJump = vi.fn()
    render(<EvidenceChip kind="lines" label="lines 12-18" target="lines-12-18" onJump={onJump} />)
    const chip = screen.getByRole('button', { name: 'Show lines 12-18' })
    await userEvent.click(chip)
    chip.focus()
    await userEvent.keyboard('{Enter}')
    expect(onJump).toHaveBeenCalledTimes(2)
    expect(onJump).toHaveBeenCalledWith('lines-12-18')
  })

  it('highlights its target on hover and focus, and clears it after', () => {
    const onHighlight = vi.fn()
    render(
      <EvidenceChip kind="probe" label="probe n=10^5" target="probe-5" onHighlight={onHighlight} />,
    )
    const chip = screen.getByRole('button')
    fireEvent.focus(chip)
    fireEvent.blur(chip)
    fireEvent.mouseEnter(chip)
    fireEvent.mouseLeave(chip)
    expect(onHighlight.mock.calls).toEqual([['probe-5'], [null], ['probe-5'], [null]])
  })

  it('records its target without claiming to control it', () => {
    render(<EvidenceChip kind="case" label="case 07" target="case-07" />)
    const chip = screen.getByRole('button')
    expect(chip).toHaveAttribute('data-target', 'case-07')
    expect(chip).not.toHaveAttribute('aria-controls')
  })
})
