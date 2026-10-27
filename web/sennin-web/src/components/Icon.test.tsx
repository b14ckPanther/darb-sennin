import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import manifest from '../design/icons/manifest.json'
import solar from '../design/icons/solar.generated.json'
import { Icon } from './Icon'

describe('Icon', () => {
  it('is hidden from assistive tech when it has no label', () => {
    const { container } = render(<Icon name="pass" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('is an image with an accessible name when labelled', () => {
    render(<Icon name="fail" label="Failed" />)
    expect(screen.getByRole('img', { name: 'Failed' })).toBeInTheDocument()
  })

  it('switches to the bold duotone glyph when filled', () => {
    const { container: a } = render(<Icon name="today" />)
    const { container: b } = render(<Icon name="today" filled />)
    expect(a.innerHTML).not.toEqual(b.innerHTML)
  })

  it('sizes from the size prop in CSS pixels', () => {
    const { container } = render(<Icon name="code" size={20} />)
    expect(container.querySelector('svg')?.getAttribute('width')).toBe('20')
  })

  it('has a generated glyph for every manifest entry and variant', () => {
    for (const name of Object.keys(manifest.icons)) {
      for (const variant of manifest.variants) {
        expect(solar.icons, `${name} ${variant}`).toHaveProperty(`${name}.${variant}`)
      }
    }
  })
})
