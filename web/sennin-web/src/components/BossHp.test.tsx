import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BossHp } from './BossHp'

describe('BossHp', () => {
  it('draws one segment per case and marks the fallen ones', () => {
    const { container } = render(<BossHp total={24} fallen={9} label="Boss health: 15 of 24" />)
    expect(screen.getByRole('img', { name: 'Boss health: 15 of 24' })).toBeInTheDocument()
    expect(container.querySelectorAll('[data-fallen]')).toHaveLength(24)
    expect(container.querySelectorAll('[data-fallen="true"]')).toHaveLength(9)
  })
})
