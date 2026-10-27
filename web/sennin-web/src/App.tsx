import { LazyMotion } from 'motion/react'
import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { BackendProvider } from './api/context'
import { Skeleton } from './components/Loadable'
import { defaultCopy, useCopy } from './copy/copy'
import { matchRoute, navigate, useLocation } from './lib/router'
import { applyDocument } from './lib/settings'
import { NotFound } from './screens/NotFound'
import { Today } from './screens/Today'

// Screens load per route so Today stays light. The chunk for the address being opened starts
// downloading at once, alongside the demo backend, instead of after it.
const loadWorkspace = () => import('./screens/Workspace')
const loadSubmission = () => import('./screens/SubmissionPage')
const startPath = window.location.pathname
if (startPath.startsWith('/problems/')) void loadWorkspace()
if (startPath.startsWith('/submissions/')) void loadSubmission()
const Workspace = lazy(loadWorkspace)
const SubmissionPage = lazy(loadSubmission)
const Library = lazy(() => import('./screens/Library'))
const Weakness = lazy(() => import('./screens/Weakness'))
const Boss = lazy(() => import('./screens/Boss'))
const History = lazy(() => import('./screens/History'))
const Ranks = lazy(() => import('./screens/Ranks'))
const Settings = lazy(() => import('./screens/Settings'))
const Profile = lazy(() => import('./screens/Profile'))
const Catalogue = lazy(() => import('./screens/Catalogue').then((m) => ({ default: m.Catalogue })))

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
    // Components use the slim `m` elements; drag, layout and springs arrive with this chunk.
    <LazyMotion strict features={() => import('./design/motion-features').then((f) => f.default)}>
      <BackendProvider fallback={<Skeleton what={defaultCopy.states.page} shape="sheet" />}>
        <Router />
      </BackendProvider>
    </LazyMotion>
  )
}

export default App
