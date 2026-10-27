import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ListRow } from './ListRow'

describe('ListRow', () => {
  it('opens its item from the row', async () => {
    const onSelect = vi.fn()
    render(
      <ListRow title="Ledger reconciliation" subtitle="hashing, sorting" onSelect={onSelect} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Ledger reconciliation/ }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('exposes swipe actions as real buttons for keyboard and screen readers', async () => {
    const onPin = vi.fn()
    render(
      <ListRow
        title="Ledger reconciliation"
        onSelect={() => undefined}
        actions={[
          { id: 'pin', label: 'Pin', icon: 'pin', onAction: onPin },
          { id: 'hide', label: 'Hide', icon: 'hide', onAction: () => undefined },
        ]}
      />,
    )
    expect(
      screen.getByRole('group', { name: 'Actions for Ledger reconciliation' }),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Pin' }))
    expect(onPin).toHaveBeenCalledOnce()
  })

  it('opens the actions when one gets keyboard focus', async () => {
    const { container } = render(
      <ListRow
        title="Rate limiter"
        onSelect={() => undefined}
        actions={[{ id: 'pin', label: 'Pin', icon: 'pin', onAction: () => undefined }]}
      />,
    )
    await userEvent.tab()
    await userEvent.tab()
    expect(container.querySelector('[data-open]')).toHaveAttribute('data-open', 'true')
  })
})

describe('ListRow while its actions are open', () => {
  it('closes the actions on tap instead of opening the item', async () => {
    const onSelect = vi.fn()
    const { container } = render(
      <ListRow
        title="Rate limiter"
        onSelect={onSelect}
        actions={[{ id: 'pin', label: 'Pin', icon: 'pin', onAction: () => undefined }]}
      />,
    )
    // Opening the tray by keyboard, then moving the pointer back to the row.
    act(() => {
      screen.getByRole('button', { name: 'Pin' }).focus()
    })
    expect(container.querySelector('[data-open]')).toHaveAttribute('data-open', 'true')
    await userEvent.click(screen.getByRole('button', { name: /Rate limiter/ }))
    expect(onSelect).not.toHaveBeenCalled()
    expect(container.querySelector('[data-open]')).toHaveAttribute('data-open', 'false')
  })
})
