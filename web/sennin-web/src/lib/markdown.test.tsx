import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Markdown } from './markdown'

describe('Markdown', () => {
  it('renders paragraphs, bold, inline code and ordered lists as elements', () => {
    const { container } = render(
      <Markdown
        source={'A **confirmed** entry has `cents`.\n\n1. Drop duplicates.\n2. Report the rest.'}
      />,
    )
    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(screen.getByText('confirmed').tagName).toBe('STRONG')
    expect(screen.getByText('cents').tagName).toBe('CODE')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('never injects HTML from the source', () => {
    const { container } = render(<Markdown source={'<img src=x onerror=alert(1)>'} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.textContent).toContain('<img')
  })
})
