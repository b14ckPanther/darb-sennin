import behaviour from '@config/ui/behaviour.json'
import { useId, useState } from 'react'
import { useHistory, useProblems } from '../api/queries'
import type { HistoryFilter, SubmissionSummary, Verdict } from '../api/types'
import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Icon, type IconName } from '../components/Icon'
import { ListRow } from '../components/ListRow'
import { Loadable } from '../components/Loadable'
import { Sheet } from '../components/Sheet'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { dayKey, formatDay, formatTime, languageShort } from '../lib/format'
import { navigate, useLocation } from '../lib/router'

const verdictMark: Record<Verdict, { icon: IconName; tone: string }> = {
  accepted: { icon: 'pass', tone: 'text-pass-mark' },
  failed: { icon: 'fail', tone: 'text-fail-mark' },
  limit: { icon: 'limit', tone: 'text-limit-mark' },
}

function useFilter(): [HistoryFilter, (patch: HistoryFilter) => void] {
  const params = new URLSearchParams(useLocation().search)
  const filter: HistoryFilter = {
    problemId: params.get('problem') ?? undefined,
    verdict: (params.get('verdict') as Verdict | null) ?? undefined,
    tag: params.get('tag') ?? undefined,
  }
  const set = (patch: HistoryFilter) => {
    const next = { ...filter, ...patch }
    const out = new URLSearchParams()
    if (next.problemId) out.set('problem', next.problemId)
    if (next.verdict) out.set('verdict', next.verdict)
    if (next.tag) out.set('tag', next.tag)
    const qs = out.toString()
    navigate(`/history${qs ? `?${qs}` : ''}`, { replace: true })
  }
  return [filter, set]
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  const id = useId()
  const c = useCopy().history
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-footnote text-ink-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        className="min-h-touch w-full rounded-control border border-line-strong bg-surface px-3 text-footnote text-ink md:min-h-9"
      >
        <option value="">{c.any}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Row({ s }: { s: SubmissionSummary }) {
  const c = useCopy().history
  const mark = verdictMark[s.verdict]
  return (
    <ListRow
      leading={<Icon name={mark.icon} filled size={20} className={mark.tone} />}
      title={s.problemTitle}
      subtitle={
        <>
          <span className={cx('mr-2', s.verdict === 'failed' && 'text-fail-ink')}>
            {c.verdicts[s.verdict]}
          </span>
          <span className="mr-2 whitespace-nowrap">
            {fill(c.cases, { passed: s.passed, total: s.total })}
          </span>
          <span className="mr-2">{languageShort(s.language)}</span>
          {s.translated ? <span className="mr-2 text-limit-ink">{c.translated}</span> : null}
          {s.praised ? <span className="text-praise-ink">{c.earned}</span> : null}
        </>
      }
      trailing={
        <span className="flex flex-col items-end">
          <span className="text-ink">{fill(c.score, { score: s.score, max: s.maxScore })}</span>
          <span className="text-footnote">{formatTime(s.createdAt)}</span>
        </span>
      }
      onSelect={() => {
        navigate(`/submissions/${s.id}`)
      }}
    />
  )
}

function Days({ rows }: { rows: SubmissionSummary[] }) {
  const groups = new Map<string, SubmissionSummary[]>()
  for (const r of rows) {
    const key = dayKey(r.createdAt)
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  return (
    <div className="space-y-6">
      {[...groups.entries()].map(([key, items]) => (
        <section key={key} aria-label={formatDay(items[0]?.createdAt ?? key)}>
          <h2 className="mb-2 px-4 text-footnote font-medium text-ink-muted md:px-0">
            {formatDay(items[0]?.createdAt ?? key)}
          </h2>
          <ul className="m-0 list-none overflow-hidden border-y border-line p-0 md:rounded-panel md:border">
            {items.map((s) => (
              <Row key={s.id} s={s} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

export default function History() {
  const c = useCopy().history
  const [filter, set] = useFilter()
  const all = useHistory()
  const shown = useHistory(filter)
  const problems = useProblems()
  const tags = [...new Set((all.data ?? []).flatMap((s) => s.tags))].sort()
  const filtered = Boolean(filter.problemId ?? filter.verdict ?? filter.tag)
  const active = [filter.problemId, filter.verdict, filter.tag].filter(Boolean).length
  const [sheet, setSheet] = useState(false)
  const filters = (
    <div className="grid grid-cols-1 gap-4 md:max-w-3xl md:grid-cols-3 md:gap-3">
      <Select
        label={c.problem}
        value={filter.problemId ?? ''}
        onChange={(v) => {
          set({ problemId: v || undefined })
        }}
        options={(problems.data ?? []).map((p) => ({ value: p.id, label: p.title }))}
      />
      <Select
        label={c.verdict}
        value={filter.verdict ?? ''}
        onChange={(v) => {
          set({ verdict: (v || undefined) as Verdict | undefined })
        }}
        options={(['accepted', 'failed', 'limit'] as const).map((v) => ({
          value: v,
          label: c.verdicts[v],
        }))}
      />
      <Select
        label={c.tag}
        value={filter.tag ?? ''}
        onChange={(v) => {
          set({ tag: v || undefined })
        }}
        options={tags.map((t) => ({ value: t, label: t }))}
      />
    </div>
  )
  return (
    <Shell title={c.title} lead={c.lead}>
      <Loadable query={all} what={c.loading}>
        {(everything) =>
          everything.length === 0 ? (
            <div className="px-4 md:px-0">
              <EmptyState
                icon="history"
                title={c.emptyTitle}
                action={
                  <Button
                    variant="secondary"
                    onClick={() => {
                      navigate('/library')
                    }}
                  >
                    {c.emptyAction}
                  </Button>
                }
              >
                {c.emptyBody}
              </EmptyState>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 px-4 md:hidden">
                <Button
                  variant="secondary"
                  icon="filter"
                  onClick={() => {
                    setSheet(true)
                  }}
                >
                  {active ? fill(c.filtersActive, { n: active }) : c.filters}
                </Button>
              </div>
              <div className="max-md:hidden">{filters}</div>
              <Sheet
                open={sheet}
                title={c.filters}
                detents={behaviour.sheet.detents}
                initialDetent={1}
                onClose={() => {
                  setSheet(false)
                }}
              >
                {filters}
              </Sheet>
              <p role="status" className="mt-5 mb-3 px-4 text-footnote text-ink-muted md:px-0">
                {shown.data ? fill(c.count, { n: shown.data.length }) : ''}
              </p>
              <Loadable query={shown} what={c.loading}>
                {(rows) =>
                  rows.length === 0 && filtered ? (
                    <div className="px-4 md:px-0">
                      <EmptyState
                        icon="search"
                        title={c.noMatchTitle}
                        action={
                          <Button
                            variant="secondary"
                            onClick={() => {
                              navigate('/history', { replace: true })
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
                    <Days rows={rows} />
                  )
                }
              </Loadable>
            </>
          )
        }
      </Loadable>
    </Shell>
  )
}
