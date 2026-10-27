import { useRanks } from '../api/queries'
import { Shell } from '../app/Shell'
import type { IconName } from '../components/Icon'
import { Icon } from '../components/Icon'
import { useCopy } from '../copy/copy'
import { Link } from '../lib/Link'

/** Phone Profile tab: one grouped list into weakness, history, ranks and settings. */
export default function Profile() {
  const copy = useCopy()
  const c = copy.profile
  const ranks = useRanks()
  const data = ranks.data
  const current = data?.ladder.find((r) => r.id === data.currentRankId)
  const rows: { href: string; title: string; detail: string; icon: IconName }[] = [
    { href: '/weakness', title: copy.nav.weakness, detail: c.weakness, icon: 'weakness' },
    { href: '/history', title: copy.nav.history, detail: c.history, icon: 'history' },
    {
      href: '/ranks',
      title: copy.nav.ranks,
      detail: current ? `${current.name}, ${data?.points.toLocaleString('en') ?? ''}` : c.ranks,
      icon: 'rank',
    },
    { href: '/settings', title: copy.nav.settings, detail: c.settings, icon: 'settings' },
  ]
  return (
    <Shell title={c.title} lead={c.lead}>
      <ul className="m-0 max-w-2xl list-none divide-y divide-line overflow-hidden border-y border-line bg-surface p-0 md:rounded-panel md:border">
        {rows.map((row) => (
          <li key={row.href}>
            <Link
              href={row.href}
              className="flex min-h-touch items-center gap-3 px-4 py-3 text-ink no-underline transition-colors duration-(--duration-micro) active:bg-surface-sunk"
            >
              <span className="grid size-8 place-items-center rounded-[8px] bg-primary text-primary-ink">
                <Icon name={row.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-body">{row.title}</span>
                <span className="block truncate text-footnote text-ink-muted">{row.detail}</span>
              </span>
              <Icon name="chevron-right" size={18} className="text-ink-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </Shell>
  )
}
