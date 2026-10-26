import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App shell', () => {
  it('names the product in a level-one heading', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Darb Sennin' })).toBeInTheDocument()
  })

  it('renders inside a main landmark', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
