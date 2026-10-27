import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { currentSettings, useSettings } from '../lib/settings'
import { BackendContext, type Backend } from './backend'

/** The demo backend and its seed load on demand, so the first paint does not carry them. */
// Requested when this module loads, in parallel with the first route's chunk.
const mockModule = import('./mock')

async function demoBackend(): Promise<Backend> {
  const { createMockApi, createMockStream } = await mockModule
  const state = () => currentSettings().demo
  const api = createMockApi(state)
  return { api, stream: createMockStream(api, state) }
}

/**
 * Phase 3 always runs the demo backend (no API exists yet). Phase 9 picks the HTTP client and the
 * SignalR connection here when SENNIN_MODE is not demo; screens do not change.
 */
export function BackendProvider({
  children,
  backend,
  fallback = null,
}: {
  children: ReactNode
  backend?: Backend
  /** Shown while the demo backend loads. */
  fallback?: ReactNode
}) {
  const [value, setValue] = useState<Backend | null>(backend ?? null)
  useEffect(() => {
    if (value) return undefined
    let live = true
    void demoBackend().then((b) => {
      if (live) setValue(b)
    })
    return () => {
      live = false
    }
  }, [value])
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
      }),
  )
  const { demo } = useSettings()
  // A changed demo switch is a changed backend: refetch everything on screen.
  useEffect(() => {
    void client.invalidateQueries()
  }, [client, demo])
  if (!value) {
    return fallback
  }
  return (
    <BackendContext.Provider value={value}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </BackendContext.Provider>
  )
}
