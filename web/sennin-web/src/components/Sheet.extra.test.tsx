import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Sheet } from './Sheet'

describe('Sheet details', () => {
  it('gives the drag handle a 44 pt target', () => {
    render(
      <Sheet open title="Filters" detents={[0.3, 0.6]} onClose={() => undefined}>
        body
      </Sheet>,
    )
    expect(screen.getByRole('button', { name: 'Drag to resize' }).className).toMatch(/min-h-touch/)
  })

  it('drags only from the handle and header, so its content stays selectable', () => {
    render(
      <Sheet open title="Filters" detents={[0.3, 0.6]} onClose={() => undefined}>
        <p>selectable</p>
      </Sheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.style.userSelect).not.toBe('none')
    expect(dialog.style.touchAction).not.toBe('pan-x')
  })

  it('puts first focus on the close button, not the handle', () => {
    render(
      <Sheet open title="Filters" detents={[0.3, 0.6]} onClose={() => undefined}>
        body
      </Sheet>,
    )
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }))
  })
})
