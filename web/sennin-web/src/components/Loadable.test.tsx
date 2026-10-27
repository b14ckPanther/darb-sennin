import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Loadable } from './Loadable'

function Probe({ fn }: { fn: () => Promise<string> }) {
  const query = useQuery({ queryKey: ['probe', fn], queryFn: fn, retry: false })
  return (
    <Loadable query={query} what="library">
      {(data) => <p>{data}</p>}
    </Loadable>
  )
}

const wrap = (fn: () => Promise<string>) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Probe fn={fn} />
    </QueryClientProvider>,
  )

describe('Loadable', () => {
  it('says what is loading instead of a bare spinner', () => {
    wrap(() => new Promise(() => undefined))
    expect(screen.getByRole('status')).toHaveTextContent('Loading library')
  })

  it('shows content when ready', async () => {
    wrap(() => Promise.resolve('Twelve problems'))
    expect(await screen.findByText('Twelve problems')).toBeInTheDocument()
  })

  it('shows a plain error with a retry', async () => {
    wrap(() => Promise.reject(new Error('down')))
    expect(await screen.findByRole('button', { name: 'Try again' })).toBeInTheDocument()
    expect(screen.getByText('Cannot reach Sennin')).toBeInTheDocument()
  })
})
