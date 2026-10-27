import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ToastRegion } from './Toast'

describe('ToastRegion', () => {
  it('keeps both live regions in the page before any message arrives', () => {
    render(<ToastRegion toast={null} onDismiss={() => undefined} />)
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
    expect(screen.getByRole('alert')).toBeEmptyDOMElement()
  })

  it('renders a message inside the existing region for its tone', () => {
    const { rerender } = render(<ToastRegion toast={null} onDismiss={() => undefined} />)
    const status = screen.getByRole('status')
    rerender(<ToastRegion toast={{ message: 'Saved.' }} onDismiss={() => undefined} />)
    expect(screen.getByRole('status')).toBe(status)
    expect(status).toHaveTextContent('Saved.')
  })
})
