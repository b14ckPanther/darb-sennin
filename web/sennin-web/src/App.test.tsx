import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('opens on Today, with the product named in the brand link', async () => {
    render(<App />)
    expect(await screen.findAllByRole('heading', { level: 1, name: 'Today' })).not.toHaveLength(0)
    expect(screen.getByRole('link', { name: /Sennin/ })).toHaveAttribute('href', '/')
  })

  it('renders inside a main landmark with a skip link to it', async () => {
    render(<App />)
    expect(await screen.findByRole('main')).toHaveAttribute('id', 'content')
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
      'href',
      '#content',
    )
  })

  it('an unknown path says so and offers the way home', async () => {
    window.history.replaceState(null, '', '/nowhere')
    render(<App />)
    expect(await screen.findByRole('button', { name: 'Go to Today' })).toBeInTheDocument()
    window.history.replaceState(null, '', '/')
  })
})
