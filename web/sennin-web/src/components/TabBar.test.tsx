import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TabBar } from './TabBar'

const items = [
  { id: 'today', label: 'Today', icon: 'today' },
  { id: 'library', label: 'Library', icon: 'library' },
  { id: 'boss', label: 'Boss', icon: 'boss' },
  { id: 'profile', label: 'Profile', icon: 'profile' },
] as const

describe('TabBar', () => {
  it('is a labelled navigation landmark', () => {
    render(<TabBar label="Main" items={[...items]} activeId="today" onSelect={() => undefined} />)
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('marks only the active tab as the current page', () => {
    render(<TabBar label="Main" items={[...items]} activeId="library" onSelect={() => undefined} />)
    expect(screen.getByRole('button', { name: 'Library' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Today' })).not.toHaveAttribute('aria-current')
  })

  it('selects a tab', async () => {
    const onSelect = vi.fn()
    render(<TabBar label="Main" items={[...items]} activeId="today" onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: 'Boss' }))
    expect(onSelect).toHaveBeenCalledWith('boss')
  })
})
