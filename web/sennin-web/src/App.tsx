import { useCopy } from './copy/copy'
import { Catalogue } from './screens/Catalogue'
import { Brand, DemoBanner } from './screens/chrome'
import { Today } from './screens/Today'
import { VerdictSheet } from './screens/VerdictSheet'

/** Phase 2 has no router yet: `?view=` picks a comp. Phase 3 brings real navigation. */
function Index() {
  const copy = useCopy().screens.index
  const links = [
    { view: 'verdict', label: copy.verdict },
    { view: 'verdict-earned', label: copy.verdictEarned },
    { view: 'today', label: copy.today },
    { view: 'catalogue', label: copy.catalogue },
  ]
  return (
    <main className="mx-auto max-w-2xl px-4 pt-10 pb-16">
      <div className="flex items-center justify-between">
        <Brand />
        <DemoBanner />
      </div>
      <h1 className="mt-10 font-display text-large-title tracking-display text-ink">
        {copy.title}
      </h1>
      <p className="mt-2 max-w-[55ch] text-lead text-ink-muted">{copy.lead}</p>
      <ul className="mt-8 list-none divide-y divide-line rounded-panel border border-line bg-surface p-0">
        {links.map((link) => (
          <li key={link.view}>
            <a
              href={`?view=${link.view}`}
              className="flex min-h-touch items-center px-4 py-3 text-body text-ink no-underline hover:bg-surface-sunk"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}

function App() {
  const view = new URLSearchParams(window.location.search).get('view')
  switch (view) {
    case 'catalogue':
      return <Catalogue />
    case 'verdict':
      return <VerdictSheet />
    case 'verdict-earned':
      return <VerdictSheet earned />
    case 'today':
      return <Today />
    default:
      return <Index />
  }
}

export default App
