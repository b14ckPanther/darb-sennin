import { useId } from 'react'
import { useWeakness } from '../api/queries'
import type { WeaknessProfile, WeaknessTag } from '../api/types'
import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Loadable } from '../components/Loadable'
import { fill, useCopy } from '../copy/copy'
import { formatShortDay } from '../lib/format'
import { Link } from '../lib/Link'
import { navigate } from '../lib/router'

/** Eight weekly values as a 2px line, end point marked; values are in the table and the label. */
function Sparkline({ values, max, label }: { values: number[]; max: number; label: string }) {
  const w = 96
  const h = 28
  const pad = 4
  const x = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1)
  const y = (v: number) => h - pad - (v / max) * (h - pad * 2)
  const path = values
    .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ')
  const last = values.length - 1
  return (
    <svg
      viewBox={`0 0 ${String(w)} ${String(h)}`}
      width={w}
      height={h}
      role="img"
      aria-label={label}
      className="shrink-0 overflow-visible"
    >
      <line
        x1={pad}
        x2={w - pad}
        y1={h - pad}
        y2={h - pad}
        className="stroke-line"
        strokeWidth={1}
      />
      <path
        d={path}
        fill="none"
        className="stroke-plot-measured"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === last ? 3.5 : 6}
          className={i === last ? 'fill-plot-measured stroke-surface' : 'fill-transparent'}
          strokeWidth={2}
        >
          <title>{String(v)}</title>
        </circle>
      ))}
    </svg>
  )
}

function direction(trend: number[]): 'rising' | 'falling' | 'steady' {
  const recent = trend[trend.length - 1] ?? 0
  const before = trend[trend.length - 3] ?? recent
  if (recent - before > 5) return 'rising'
  if (before - recent > 5) return 'falling'
  return 'steady'
}

function Row({ t, rank, profile }: { t: WeaknessTag; rank: number; profile: WeaknessProfile }) {
  const c = useCopy().weakness
  const id = useId()
  const dir = direction(t.trend)
  return (
    <li
      aria-labelledby={id}
      className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 border-b border-line py-5 md:grid-cols-[2rem_minmax(0,1fr)_auto] md:gap-x-6"
    >
      <span className="num pt-0.5 text-callout text-ink-muted">{rank}</span>
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id={id} className="font-mono text-body text-ink">
            {t.tag}
          </h2>
          <span className="num text-callout text-ink">
            <span className="sr-only">
              {fill(c.score, { score: t.score, max: profile.scoreMax })}
            </span>
            <span aria-hidden="true">{t.score}</span>
          </span>
        </div>
        <div aria-hidden="true" className="mt-2 h-2 rounded-[2px] bg-surface-sunk">
          <div
            className="h-2 rounded-[2px] bg-plot-measured"
            style={{ width: `${String((t.score / profile.scoreMax) * 100)}%` }}
          />
        </div>
        <p className="mt-2 max-w-[60ch] text-footnote text-ink-muted">{t.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <Sparkline
            values={t.trend}
            max={profile.scoreMax}
            label={fill(c.trendLabel, {
              tag: t.tag,
              weeks: profile.weeks,
              values: t.trend.join(', '),
            })}
          />
          <span className="text-footnote text-ink-muted">
            {fill(c.trend, { weeks: profile.weeks })},{' '}
            <span className="text-ink">{c[dir].toLowerCase()}</span>
          </span>
        </div>
        {t.lastHits.length > 0 ? (
          <div className="mt-3 text-footnote">
            <span className="text-ink-muted">{c.hits} </span>
            {t.lastHits.map((h, i) => (
              <span key={h.submissionId}>
                {i > 0 ? ', ' : ''}
                <Link
                  href={`/submissions/${h.submissionId}`}
                  className="text-ink underline decoration-line-strong hover:decoration-ink"
                >
                  {h.problemTitle} ({formatShortDay(h.createdAt)})
                </Link>
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <div className="col-start-2 mt-4 md:col-start-3 md:row-start-1 md:mt-0 md:self-center">
        <Button
          variant="secondary"
          icon="run"
          onClick={() => {
            navigate(`/problems/${t.practiseProblemId}`)
          }}
          aria-label={`${c.practise}: ${t.tag}`}
        >
          {c.practise}
        </Button>
      </div>
    </li>
  )
}

function Table({ profile }: { profile: WeaknessProfile }) {
  const c = useCopy().weakness
  return (
    // Tables ignore width: 1px, so the screen-reader table sits in a clipped wrapper.
    <div className="sr-only">
      <table>
        <caption>{c.tableCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{c.tag}</th>
            <th scope="col">{c.now}</th>
            {Array.from({ length: profile.weeks }, (_, i) => (
              <th key={i} scope="col">
                {fill(c.week, { n: i + 1 })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profile.tags.map((t) => (
            <tr key={t.tag}>
              <th scope="row">{t.tag}</th>
              <td>{t.score}</td>
              {t.trend.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Weakness() {
  const c = useCopy().weakness
  const query = useWeakness()
  return (
    <Shell title={c.title} lead={c.lead}>
      <Loadable query={query} what={c.loading}>
        {(profile) =>
          profile.tags.length === 0 ? (
            <div className="px-4 md:px-0">
              <EmptyState
                icon="weakness"
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
            <div className="px-4 md:px-0">
              <ol className="m-0 max-w-4xl list-none border-t border-line-strong p-0">
                {profile.tags.map((t, i) => (
                  <Row key={t.tag} t={t} rank={i + 1} profile={profile} />
                ))}
              </ol>
              <Table profile={profile} />
            </div>
          )
        }
      </Loadable>
    </Shell>
  )
}
