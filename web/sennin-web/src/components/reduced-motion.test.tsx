import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Every animated component, rendered with prefers-reduced-motion: reduce. The snapshots pin the
// still versions: no entrance offsets, no transforms, no drag handlers that move content.
vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('motion/react')>()),
  useReducedMotion: () => true,
}))

const { Button } = await import('./Button')
const { Toast } = await import('./Toast')
const { Sheet } = await import('./Sheet')
const { TabBar } = await import('./TabBar')
const { ListRow } = await import('./ListRow')
const { PraiseLine } = await import('./PraiseLine')

function noTransforms(root: HTMLElement) {
  for (const el of [root, ...root.querySelectorAll<HTMLElement>('*')]) {
    expect(el.style.transform, el.outerHTML.slice(0, 80)).toMatch(/^(none)?$/)
    expect(el.style.opacity, el.outerHTML.slice(0, 80)).not.toBe('0')
  }
}

describe('reduced motion', () => {
  it('Button', () => {
    const { container } = render(<Button>Submit</Button>)
    noTransforms(container)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('Toast appears in place', () => {
    const { container } = render(<Toast message="Saved." onDismiss={() => undefined} />)
    noTransforms(container)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('Sheet opens at its detent without sliding', () => {
    render(
      <Sheet open title="Filters" detents={[0.3, 0.6]} onClose={() => undefined}>
        body
      </Sheet>,
    )
    noTransforms(document.body)
    expect(screen.getByRole('dialog').outerHTML).toMatchSnapshot()
  })

  it('TabBar', () => {
    const { container } = render(
      <TabBar
        label="Main"
        items={[{ id: 'today', label: 'Today', icon: 'today' }]}
        activeId="today"
        onSelect={() => undefined}
      />,
    )
    noTransforms(container)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('ListRow', () => {
    const { container } = render(
      <ListRow
        title="Rate limiter"
        onSelect={() => undefined}
        actions={[{ id: 'pin', label: 'Pin', icon: 'pin', onAction: () => undefined }]}
      />,
    )
    noTransforms(container)
    expect(container.innerHTML).toMatchSnapshot()
  })

  it('PraiseLine stamp is placed, not pressed in', () => {
    const { container } = render(<PraiseLine earned text="Clean." />)
    noTransforms(container)
    expect(container.innerHTML).toMatchSnapshot()
  })
})
