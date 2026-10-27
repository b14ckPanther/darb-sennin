import behaviour from '@config/ui/behaviour.json'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useStatus } from '../api/queries'
import { Icon } from '../components/Icon'
import { LargeTitle } from '../components/LargeTitle'
import { Sheet } from '../components/Sheet'
import { TabBar, type TabItem } from '../components/TabBar'
import { useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { Link } from '../lib/Link'
import { navigate, useLocation } from '../lib/router'
import { Brand, DemoBanner } from '../screens/chrome'

import { tabFor, tabHome, type TabId } from './tabs'

function typing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.closest('.cm-editor') !== null
  )
}

/** `?` opens the shortcut sheet; `G` then a letter moves between sections. */
function useGlobalShortcuts(openSheet: () => void) {
  const chord = useRef<number | null>(null)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || typing(event.target)) return
      if (event.key === '?') {
        event.preventDefault()
        openSheet()
        return
      }
      const key = event.key.toLowerCase()
      if (
        chord.current !== null &&
        Date.now() - chord.current < behaviour.shortcuts.chordWindowMs
      ) {
        chord.current = null
        const to = { l: '/library', t: '/', b: '/boss', h: '/history', w: '/weakness' }[key]
        if (to) {
          event.preventDefault()
          navigate(to)
        }
        return
      }
      chord.current = key === 'g' ? Date.now() : null
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [openSheet])
}

function ShortcutSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const copy = useCopy().nav.shortcuts
  return (
    <Sheet
      open={open}
      title={copy.title}
      detents={behaviour.sheet.detents}
      initialDetent={behaviour.sheet.detents.length - 2}
      onClose={onClose}
    >
      <dl className="m-0 divide-y divide-line">
        {copy.items.map((item) => (
          <div key={item.does} className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-callout text-ink">{item.does}</dt>
            <dd className="m-0 flex shrink-0 gap-1">
              {item.keys.map((k) => (
                <kbd
                  key={k}
                  className="rounded-chip border border-line-strong bg-surface-sunk px-1.5 py-0.5 text-footnote text-ink"
                >
                  {k}
                </kbd>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </Sheet>
  )
}

/** System notices that change what a run means: the judge is paused, the reviewer is out. */
function StatusNotice() {
  const copy = useCopy().states
  const status = useStatus()
  if (!status.data) return null
  const notes = [
    !status.data.judgeRunning && { icon: 'queue' as const, text: copy.judgePaused.body },
    !status.data.reviewerAvailable && { icon: 'info' as const, text: copy.reviewerDown.body },
  ].filter((n) => n !== false)
  if (notes.length === 0) return null
  return (
    <div role="status" className="mx-auto max-w-[1180px] px-4 pt-3 md:px-8">
      {notes.map((note) => (
        <p
          key={note.text}
          className="flex items-start gap-2 border-y border-line-strong py-2 text-footnote text-ink"
        >
          <Icon name={note.icon} size={16} className="mt-px shrink-0 text-limit-mark" />
          {note.text}
        </p>
      ))}
    </div>
  )
}

interface ShellProps {
  title: string
  children: ReactNode
  /** Subtitle under the large title. */
  lead?: ReactNode
  /** Controls next to the title (filters, actions). */
  trailing?: ReactNode
  /** Pushed pages get a back link (phone bar and above the desktop title). */
  back?: { href: string; label: string }
  /**
   * page: large title and tab bar. workspace: draws its own bars, no tab bar (UI_DESIGN.md 5).
   * full: full-bleed content (the boss) with the tab bar on phones.
   */
  variant?: 'page' | 'workspace' | 'full'
  /** Hide the visible title (it stays for screen readers), for pages whose content is the title. */
  quietTitle?: boolean
}

/** Page frame: desktop top bar, phone large title and tab bar, skip link, shortcut sheet. */
export function Shell({
  title,
  children,
  lead,
  trailing,
  back,
  variant = 'page',
  quietTitle,
}: ShellProps) {
  const copy = useCopy()
  const nav = copy.nav
  const { path } = useLocation()
  const [sheet, setSheet] = useState(false)
  const openSheet = () => {
    setSheet(true)
  }
  useGlobalShortcuts(openSheet)

  useEffect(() => {
    document.title = `${title} · ${copy.screens.index.title}`
  }, [title, copy.screens.index.title])

  const tabs: TabItem[] = [
    { id: 'today', label: nav.today, icon: 'today' },
    { id: 'library', label: nav.library, icon: 'library' },
    { id: 'boss', label: nav.boss, icon: 'boss' },
    { id: 'profile', label: nav.profile, icon: 'profile' },
  ]
  const desktopLinks = [
    { href: '/', label: nav.today },
    { href: '/library', label: nav.library },
    { href: '/weakness', label: nav.weakness },
    { href: '/boss', label: nav.boss },
    { href: '/history', label: nav.history },
    { href: '/ranks', label: nav.ranks },
  ]
  const backLink = back ? (
    <Link
      href={back.href}
      className="-ml-2 inline-flex min-h-touch items-center gap-0.5 rounded-control pr-2 text-callout text-ink-muted no-underline hover:text-ink"
    >
      <Icon name="chevron-left" size={20} />
      {back.label}
    </Link>
  ) : null

  const tabBar = (
    <div className="fixed inset-x-0 bottom-0 z-30 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] md:hidden">
      <TabBar
        label={nav.label}
        items={tabs}
        activeId={tabFor(path)}
        onSelect={(id) => {
          navigate(tabHome[id as TabId])
        }}
      />
    </div>
  )

  return (
    <div
      className={cx(
        'min-h-dvh',
        variant !== 'workspace' && 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-16',
      )}
    >
      <a
        href="#content"
        className="sr-only z-50 rounded-control bg-surface px-3 py-2 text-callout text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {nav.skip}
      </a>
      <header
        className={cx(
          'material-bar sticky top-0 z-30 border-b border-line pt-[env(safe-area-inset-top)]',
          variant === 'workspace' ? 'max-lg:hidden' : 'max-md:hidden',
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-6 px-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] md:px-8">
          <Brand />
          <nav aria-label={nav.label} className="max-md:hidden">
            <ul className="m-0 flex list-none gap-0.5 p-0">
              {desktopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    section
                    className="inline-flex min-h-9 items-center rounded-control px-3 text-callout font-medium text-ink-muted no-underline hover:text-ink aria-[current=page]:bg-surface-sunk aria-[current=page]:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={openSheet}
              className="grid size-touch place-items-center rounded-control text-ink-muted hover:bg-surface-sunk hover:text-ink max-md:hidden"
            >
              <Icon name="keyboard" size={20} label={nav.shortcuts.open} />
            </button>
            <Link
              href="/settings"
              className="grid size-touch place-items-center rounded-control text-ink-muted hover:bg-surface-sunk hover:text-ink aria-[current=page]:text-ink"
            >
              <Icon name="settings" size={20} label={nav.settings} />
            </Link>
            <DemoBanner />
          </div>
        </div>
      </header>

      {variant === 'workspace' ? (
        <main id="content" tabIndex={-1} className="outline-none">
          {children}
        </main>
      ) : variant === 'full' ? (
        <>
          <StatusNotice />
          <main id="content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          {tabBar}
        </>
      ) : (
        <>
          <div className="md:hidden">
            <LargeTitle title={title} leading={backLink} trailing={<DemoBanner />}>
              {lead ? <div className="text-callout text-ink-muted">{lead}</div> : null}
            </LargeTitle>
            {trailing ? <div className="px-4 pt-2">{trailing}</div> : null}
          </div>
          <StatusNotice />
          <main id="content" tabIndex={-1} className="mx-auto max-w-[1180px] outline-none md:px-8">
            <div className="max-md:hidden">
              <div className="pt-8 pb-6">
                {backLink}
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className={cx(quietTitle && 'sr-only')}>
                    <h1 className="font-display text-large-title tracking-display text-ink">
                      {title}
                    </h1>
                    {lead ? <div className="mt-1 text-callout text-ink-muted">{lead}</div> : null}
                  </div>
                  {trailing}
                </div>
              </div>
            </div>
            {children}
          </main>
          {tabBar}
        </>
      )}
      <ShortcutSheet
        open={sheet}
        onClose={() => {
          setSheet(false)
        }}
      />
    </div>
  )
}
