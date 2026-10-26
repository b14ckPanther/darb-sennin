import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('shows its text', () => {
    render(<Tag>empty input</Tag>)
    expect(screen.getByText('empty input')).toBeInTheDocument()
  })

  it('marks a weakness tag so it reads differently from a plain one', () => {
    render(<Tag tone="weak">off-by-one</Tag>)
    expect(screen.getByText('off-by-one').closest('[data-tone]')).toHaveAttribute(
      'data-tone',
      'weak',
    )
  })
})
