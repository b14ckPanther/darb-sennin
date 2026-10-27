import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Sheet } from './Sheet'

const detents = [0.3, 0.6, 0.92]

describe('Sheet', () => {
  it('renders nothing while closed', () => {
    render(
      <Sheet open={false} title="Filters" detents={detents} onClose={() => undefined}>
        body
      </Sheet>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('is a labelled modal dialog when open and takes focus', () => {
    render(
      <Sheet open title="Filters" detents={detents} onClose={() => undefined}>
        body
      </Sheet>,
    )
    const dialog = screen.getByRole('dialog', { name: 'Filters' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('closes on Escape and from its close button', async () => {
    const onClose = vi.fn()
    render(
      <Sheet open title="Filters" detents={detents} onClose={onClose}>
        body
      </Sheet>,
    )
    await userEvent.keyboard('{Escape}')
    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('steps through detents from the keyboard with its handle', async () => {
    render(
      <Sheet open title="Filters" detents={detents} initialDetent={0} onClose={() => undefined}>
        body
      </Sheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('data-detent', '0')
    await userEvent.click(screen.getByRole('button', { name: 'Drag to resize' }))
    expect(dialog).toHaveAttribute('data-detent', '1')
  })

  it('keeps Tab inside the sheet', async () => {
    render(
      <Sheet open title="Filters" detents={detents} onClose={() => undefined}>
        <button type="button">Apply</button>
      </Sheet>,
    )
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 5; i += 1) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})
