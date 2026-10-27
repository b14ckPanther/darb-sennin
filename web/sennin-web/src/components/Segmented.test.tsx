import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Segmented } from './Segmented'

function Harness() {
  const [value, setValue] = useState('code')
  return (
    <Segmented
      label="Pane"
      value={value}
      onChange={setValue}
      options={[
        { value: 'statement', label: 'Statement' },
        { value: 'code', label: 'Code' },
        { value: 'verdict', label: 'Verdict' },
      ]}
    />
  )
}

describe('Segmented', () => {
  it('is one tab stop: only the checked option is focusable', () => {
    render(<Harness />)
    expect(screen.getByRole('radio', { name: 'Code' })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('radio', { name: 'Statement' })).toHaveAttribute('tabindex', '-1')
  })

  it('arrow keys move and select, wrapping at the ends', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'Code' }))
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Verdict' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Verdict' })).toHaveFocus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('radio', { name: 'Statement' })).toHaveAttribute('aria-checked', 'true')
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('radio', { name: 'Verdict' })).toHaveAttribute('aria-checked', 'true')
  })
})
