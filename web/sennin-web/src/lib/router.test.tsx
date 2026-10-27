import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { Link } from './Link'
import { matchRoute, navigate, useLocation } from './router'

function Where() {
  const loc = useLocation()
  return <p>{loc.path + loc.search}</p>
}

describe('router', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('matches static and parameter routes', () => {
    expect(matchRoute('/', '/')).toEqual({})
    expect(matchRoute('/problems/:id', '/problems/fewest-coins')).toEqual({ id: 'fewest-coins' })
    expect(matchRoute('/problems/:id', '/problems')).toBeNull()
    expect(matchRoute('/history', '/history/')).toEqual({})
  })

  it('navigate updates subscribers', () => {
    render(<Where />)
    act(() => {
      navigate('/library?tag=hashing')
    })
    expect(screen.getByText('/library?tag=hashing')).toBeInTheDocument()
  })

  it('a link navigates without a page load and keeps modifier clicks native', async () => {
    render(
      <>
        <Link href="/boss">Boss</Link>
        <Where />
      </>,
    )
    await userEvent.click(screen.getByRole('link', { name: 'Boss' }))
    expect(screen.getByText('/boss')).toBeInTheDocument()
  })

  it('marks the current link', () => {
    window.history.replaceState(null, '', '/ranks')
    render(<Link href="/ranks">Ranks</Link>)
    expect(screen.getByRole('link', { name: 'Ranks' })).toHaveAttribute('aria-current', 'page')
  })
})
