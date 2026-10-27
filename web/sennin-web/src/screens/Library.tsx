import behaviour from '@config/ui/behaviour.json'
import { useDeferredValue, useId, useState } from 'react'
import { useProblemFlags, useProblems } from '../api/queries'
import type { ProblemStatus, ProblemSummary } from '../api/types'
import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { Difficulty } from '../components/Difficulty'
import { EmptyState } from '../components/EmptyState'
import { Icon, type IconName } from '../components/Icon'
import { ListRow } from '../components/ListRow'
import { Loadable } from '../components/Loadable'
import { Segmented } from '../components/Segmented'
import { Sheet } from '../components/Sheet'
import { ToastRegion } from '../components/Toast'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { formatShortDay } from '../lib/format'
import { navigate, useLocation } from '../lib/router'

const statuses: ProblemStatus[] = ['unsolved', 'failed', 'solved', 'clean']

const statusMark: Record<ProblemStatus, { icon: IconName; filled: boolean; tone: string }> = {
  unsolved: { icon: 'pending', filled: false, tone: 'text-pending-mark' },
  failed: { icon: 'fail', filled: true, tone: 'text-fail-mark' },
  solved: { icon: 'pass', filled: false, tone: 'text-pass-mark' },
  clean: { icon: 'pass', filled: true, tone: 'text-pass-mark' },
}

interface Filters {
  q: string
  tag: string
  difficulty: string
  status: string
  hidden: boolean
}

/** Filters live in the URL so a filtered library can be linked and survives Back. */
function useFilters(): [Filters, (patch: Partial<Filters>) => void] {
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const filters: Filters = {
    q: params.get('q') ?? '',
    tag: params.get('tag') ?? '',
    difficulty: params.get('difficulty') ?? '',
    status: params.get('status') ?? '',
    hidden: params.get('hidden') === '1',
  }
  const set = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch }
    const out = new URLSearchParams()
    for (const [k, v] of Object.entries(next)) {
      if (v === true) out.set(k, '1')
      else if (typeof v === 'string' && v) out.set(k, v)
    }
    const qs = out.toString()
    navigate(`/library${qs ? `?${qs}` : ''}`, { replace: true })
  }
  return [filters, set]
}

function apply(problems: ProblemSummary[], f: Filters, query: string): ProblemSummary[] {
  const needle = query.trim().toLowerCase()
  return problems.filter(
    (p) =>
      (!needle || p.title.toLowerCase().includes(needle)) &&
      (!f.tag || p.tags.includes(f.tag)) &&
      (!f.difficulty || String(p.difficulty) === f.difficulty) &&
      (!f.status || p.status === f.status),
  )
}

function FilterFields({
  problems,
  filters,
  set,
}: {
  problems: ProblemSummary[]
  filters: Filters
  set: (p: Partial<Filters>) => void
}) {
  const copy = useCopy()
  const c = copy.library
  const tagId = useId()
  const tags = [...new Set(problems.flatMap((p) => p.tags))].sort()
  const max = Math.max(...problems.map((p) => p.difficulty))
  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
      <div>
        <p className="mb-1.5 text-footnote text-ink-muted">{c.status}</p>
        <Segmented
          label={c.status}
          value={filters.status}
          onChange={(status) => {
            set({ status })
          }}
          options={[
            { value: '', label: c.any },
            ...statuses.map((s) => ({ value: s, label: c.statuses[s] })),
          ]}
        />
      </div>
      <div>
        <p className="mb-1.5 text-footnote text-ink-muted">{c.difficulty}</p>
        <Segmented
          label={c.difficulty}
          value={filters.difficulty}
          onChange={(difficulty) => {
            set({ difficulty })
          }}
          options={[
            { value: '', label: c.any },
            ...Array.from({ length: max }, (_, i) => ({
              value: String(i + 1),
              label: <Difficulty level={i + 1} max={max} label="" />,
              name: fill(copy.screens.today.difficulty, { n: i + 1, max }),
            })),
          ]}
        />
      </div>
      <div>
        <label htmlFor={tagId} className="mb-1.5 block text-footnote text-ink-muted">
          {c.tag}
        </label>
        <select
          id={tagId}
          value={filters.tag}
          onChange={(e) => {
            set({ tag: e.target.value })
          }}
          className="min-h-9 rounded-control border border-line-strong bg-surface px-3 pr-8 text-footnote text-ink pointer-coarse:min-h-touch"
        >
          <option value="">{c.any}</option>
          {tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Row({
  p,
  max,
  onFlags,
}: {
  p: ProblemSummary
  max: number
  onFlags: (p: ProblemSummary, flags: { pinned?: boolean; hidden?: boolean }) => void
}) {
  const copy = useCopy()
  const c = copy.library
  const mark = statusMark[p.status]
  return (
    <ListRow
      leading={<Icon name={mark.icon} filled={mark.filled} size={20} className={mark.tone} />}
      title={p.title}
      subtitle={
        <>
          <span className={cx('mr-2', p.status === 'failed' && 'text-fail-ink')}>
            {c.statuses[p.status]}
            {p.isBoss ? `, ${c.boss.toLowerCase()}` : ''}
          </span>
          <span>{p.tags.join(', ')}</span>
          <span className="ml-2 max-sm:hidden">
            {p.lastAttemptAt ? fill(c.last, { when: formatShortDay(p.lastAttemptAt) }) : c.never}
          </span>
        </>
      }
      trailing={
        <span className="flex items-center gap-4">
          <span className="w-16 text-right max-sm:w-auto">
            {p.bestScore === null ? (
              <span className="text-ink-muted">-</span>
            ) : (
              fill(c.best, { score: p.bestScore })
            )}
          </span>
          <Difficulty
            level={p.difficulty}
            max={max}
            label={fill(copy.screens.today.difficulty, { n: p.difficulty, max })}
          />
        </span>
      }
      onSelect={() => {
        navigate(`/problems/${p.id}`)
      }}
      actions={[
        {
          id: 'pin',
          label: p.pinned ? c.unpin : c.pin,
          icon: 'pin',
          onAction: () => {
            onFlags(p, { pinned: !p.pinned })
          },
        },
        {
          id: 'hide',
          label: p.hidden ? c.unhide : c.hide,
          icon: 'hide',
          onAction: () => {
            onFlags(p, { hidden: !p.hidden })
          },
        },
      ]}
    />
  )
}

function Group({
  title,
  rows,
  max,
  onFlags,
}: {
  title: string
  rows: ProblemSummary[]
  max: number
  onFlags: Parameters<typeof Row>[0]['onFlags']
}) {
  const id = useId()
  if (rows.length === 0) return null
  return (
    <section aria-labelledby={id} className="mt-6 first:mt-0">
      <h2 id={id} className="mb-2 px-4 text-footnote font-medium text-ink-muted md:px-0">
        {title}
      </h2>
      <ul className="m-0 list-none overflow-hidden border-y border-line p-0 md:rounded-panel md:border">
        {rows.map((p) => (
          <Row key={p.id} p={p} max={max} onFlags={onFlags} />
        ))}
      </ul>
    </section>
  )
}

function LibraryBody({ problems }: { problems: ProblemSummary[] }) {
  const c = useCopy().library
  const [filters, set] = useFilters()
  const query = useDeferredValue(filters.q)
  const [sheet, setSheet] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const flags = useProblemFlags()
  const searchId = useId()
  const max = Math.max(...problems.map((p) => p.difficulty))
  const matches = apply(problems, filters, query)
  const shown = matches.filter((p) => filters.hidden || !p.hidden)
  const hiddenCount = matches.filter((p) => p.hidden).length
  const active = [filters.tag, filters.difficulty, filters.status].filter(Boolean).length

  const onFlags = (p: ProblemSummary, change: { pinned?: boolean; hidden?: boolean }) => {
    flags.mutate({ id: p.id, ...change })
    if (change.pinned) setToast(fill(c.pinnedToast, { title: p.title }))
    if (change.hidden) setToast(fill(c.hiddenToast, { title: p.title }))
  }

  return (
    <div className="pb-8">
      <div className="flex items-center gap-2 px-4 md:px-0">
        <label htmlFor={searchId} className="relative min-w-0 flex-1 md:max-w-sm">
          <span className="sr-only">{c.search}</span>
          <Icon
            name="search"
            size={18}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
          />
          <input
            id={searchId}
            type="search"
            value={filters.q}
            placeholder={c.search}
            onChange={(e) => {
              set({ q: e.target.value })
            }}
            className="min-h-touch w-full rounded-control border border-line bg-surface pr-3 pl-9 text-body text-ink placeholder:text-ink-muted md:min-h-10 md:text-callout"
          />
        </label>
        <Button
          variant="secondary"
          icon="filter"
          className="md:hidden"
          onClick={() => {
            setSheet(true)
          }}
        >
          {active ? fill(c.filtersActive, { n: active }) : c.filters}
        </Button>
      </div>
      <div className="mt-5 max-md:hidden">
        <FilterFields problems={problems} filters={filters} set={set} />
      </div>

      <div className="mt-6">
        {shown.length === 0 ? (
          <div className="px-4 md:px-0">
            <EmptyState
              icon="search"
              title={c.noMatchTitle}
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    set({ q: '', tag: '', difficulty: '', status: '' })
                  }}
                >
                  {c.clear}
                </Button>
              }
            >
              {c.noMatchBody}
            </EmptyState>
          </div>
        ) : (
          <>
            <Group
              title={c.pinned}
              rows={shown.filter((p) => p.pinned)}
              max={max}
              onFlags={onFlags}
            />
            <Group
              title={c.all}
              rows={shown.filter((p) => !p.pinned)}
              max={max}
              onFlags={onFlags}
            />
          </>
        )}
        {hiddenCount > 0 || filters.hidden ? (
          <div className="mt-4 px-4 md:px-0">
            <Button
              variant="quiet"
              icon="hide"
              onClick={() => {
                set({ hidden: !filters.hidden })
              }}
            >
              {filters.hidden ? c.hideHidden : fill(c.showHidden, { n: hiddenCount })}
            </Button>
          </div>
        ) : null}
      </div>

      <Sheet
        open={sheet}
        title={c.filters}
        detents={behaviour.sheet.detents}
        initialDetent={1}
        onClose={() => {
          setSheet(false)
        }}
      >
        <FilterFields problems={problems} filters={filters} set={set} />
        <div className="mt-6 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              set({ tag: '', difficulty: '', status: '' })
            }}
          >
            {c.clear}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              setSheet(false)
            }}
          >
            {fill(c.done, { n: shown.length })}
          </Button>
        </div>
      </Sheet>
      <ToastRegion
        toast={toast ? { message: toast } : null}
        durationMs={behaviour.toast.durationMs}
        onDismiss={() => {
          setToast(null)
        }}
      />
    </div>
  )
}

export default function Library() {
  const c = useCopy().library
  const problems = useProblems()
  return (
    <Shell
      title={c.title}
      lead={problems.data ? fill(c.lead, { count: problems.data.length }) : undefined}
    >
      <Loadable query={problems} what={c.loading}>
        {(data) => <LibraryBody problems={data} />}
      </Loadable>
    </Shell>
  )
}
