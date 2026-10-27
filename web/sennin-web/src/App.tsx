import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BackendProvider } from './api/context'
import { Skeleton } from './components/Loadable'
import { useCopy } from './copy/copy'
import { matchRoute, navigate, useLocation } from './lib/router'
import { applyDocument } from './lib/settings'
import { Catalogue } from './screens/Catalogue'
import { NotFound } from './screens/NotFound'
import { Today } from './screens/Today'

// The workspace carries the editor; it loads on first visit so Today and the library stay light.
const Workspace = lazy(() => import('./screens/Workspace'))
const SubmissionPage = lazy(() => import('./screens/SubmissionPage'))
const Library = lazy(() => import('./screens/Library'))
const Weakness = lazy(() => import('./screens/Weakness'))
const Boss = lazy(() => import('./screens/Boss'))
const History = lazy(() => import('./screens/History'))
const Ranks = lazy(() => import('./screens/Ranks'))
const Settings = lazy(() => import('./screens/Settings'))
const Profile = lazy(() => import('./screens/Profile'))

type Route = [string, (params: Record<string, string>) => ReactNode]

const routes: Route[] = [
  ['/', () => <Today />],
  ['/library', () => <Library />],
  ['/problems/:id', (p) => <Workspace key={p.id} problemId={p.id ?? ''} />],
  ['/submissions/:id', (p) => <SubmissionPage key={p.id} submissionId={p.id ?? ''} />],
  ['/weakness', () => <Weakness />],
  ['/boss', () => <Boss />],
  ['/history', () => <History />],
  ['/ranks', () => <Ranks />],
  ['/settings', () => <Settings />],
  ['/profile', () => <Profile />],
  ['/catalogue', () => <Catalogue />],
]

// Phase 2 comps lived under ?view=; old links land on the real screens.
const legacyViews: Record<string, string> = {
  catalogue: '/catalogue',
  today: '/',
  verdict: '/submissions/sub-040',
  'verdict-earned': '/submissions/sub-038',
}

function Router() {
  const { path, search } = useLocation()
  const copy = useCopy()
  const legacy = new URLSearchParams(search).get('view')
  const redirect = legacy ? legacyViews[legacy] : undefined
  useEffect(() => {
    if (redirect) navigate(redirect, { replace: true })
  }, [redirect])
  if (redirect) return null
  for (const [pattern, render] of routes) {
    const params = matchRoute(pattern, path)
    if (params) {
      return (
        <Suspense fallback={<Skeleton what={copy.states.page} shape="sheet" />}>
          {render(params)}
        </Suspense>
      )
    }
  }
  return <NotFound />
}

function App() {
  useEffect(() => {
    applyDocument()
  }, [])
  return (
    <BackendProvider>
      <Router />
    </BackendProvider>
  )
}

export default App
