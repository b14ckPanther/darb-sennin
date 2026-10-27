import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('is a real button that defaults to type="button"', () => {
    render(<Button>Submit</Button>)
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'button')
  })

  it('calls onClick when pressed', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Run samples</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Run samples' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Submit
      </Button>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('carries its variant for styling', () => {
    render(<Button variant="quiet">Hide</Button>)
    expect(screen.getByRole('button', { name: 'Hide' })).toHaveAttribute('data-variant', 'quiet')
  })

  it('keeps an icon decorative next to the visible label', () => {
    render(<Button icon="run">Run samples</Button>)
    expect(
      screen.getByRole('button', { name: 'Run samples' }).querySelector('svg'),
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
