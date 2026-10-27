import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { currentSettings, useSettings } from '../lib/settings'
import { createMockApi, createMockStream } from './mock'
import { BackendContext, type Backend } from './backend'

function demoBackend(): Backend {
  const state = () => currentSettings().demo
  const api = createMockApi(state)
  return { api, stream: createMockStream(api, state) }
}

/**
 * Phase 3 always runs the demo backend (no API exists yet). Phase 9 picks the HTTP client and the
 * SignalR connection here when SENNIN_MODE is not demo; screens do not change.
 */
export function BackendProvider({ children, backend }: { children: ReactNode; backend?: Backend }) {
  const [value] = useState(() => backend ?? demoBackend())
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
  return (
    <BackendContext.Provider value={value}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </BackendContext.Provider>
  )
}
