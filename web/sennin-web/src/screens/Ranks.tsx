import { useRanks } from '../api/queries'
import type { RanksView } from '../api/types'
import { Shell } from '../app/Shell'
import { Icon } from '../components/Icon'
import { Loadable } from '../components/Loadable'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'

function Ladder({ r }: { r: RanksView }) {
  const c = useCopy().ranks
  const at = r.ladder.findIndex((x) => x.id === r.currentRankId)
  return (
    <ol className="m-0 list-none p-0">
      {[...r.ladder].reverse().map((rank) => {
        const i = r.ladder.indexOf(rank)
        const current = i === at
        const reached = i < at
        const next = r.ladder[i + 1]
        const progress =
          current && next ? (r.points - rank.threshold) / (next.threshold - rank.threshold) : 0
        return (
          <li
            key={rank.id}
            aria-current={current ? 'step' : undefined}
            className={cx(
              'grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-3 border-b border-line py-5',
              current && 'border-b-line-strong',
            )}
          >
            <span className="flex justify-center pt-1.5">
              <span
                aria-hidden="true"
                className={cx(
                  'block size-3 rounded-full border-2',
                  current
                    ? 'border-primary bg-primary'
                    : reached
                      ? 'border-primary'
                      : 'border-line-strong',
                )}
              />
            </span>
            <div className="min-w-0">
              <h2
                className={cx(
                  'font-display tracking-display',
                  current
                    ? 'text-title-1 text-ink'
                    : reached
                      ? 'text-title-3 text-ink'
                      : 'text-title-3 text-ink-muted',
                )}
              >
                {rank.name}
              </h2>
              <p className="mt-1 max-w-[52ch] text-callout text-ink-muted">{rank.description}</p>
              {current ? (
                <>
                  <p className="mt-2 text-footnote font-medium text-ink">{c.current}</p>
                  {next ? (
                    <div className="mt-3 max-w-md">
                      <div className="h-1.5 rounded-full bg-surface-sunk">
                        <div
                          className="h-1.5 rounded-full bg-primary"
                          style={{ width: `${String(Math.round(progress * 100))}%` }}
                        />
                      </div>
                      <p className="num mt-1.5 text-footnote text-ink-muted">
                        {fill(c.ahead, { left: (next.threshold - r.points).toLocaleString('en') })}
                      </p>
                    </div>
                  ) : null}
                </>
              ) : reached ? (
                <p className="mt-2 flex items-center gap-1.5 text-footnote text-ink-muted">
                  <Icon name="check" size={14} />
                  {c.reached}
                </p>
              ) : null}
            </div>
            <span className="num pt-1.5 text-footnote text-ink-muted">
              {fill(c.from, { points: rank.threshold.toLocaleString('en') })}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Record({ r }: { r: RanksView }) {
  const c = useCopy().ranks
  const items = [
    { label: c.points, value: r.points.toLocaleString('en') },
    { label: c.streak, value: fill(c.days, { n: r.streak.current }) },
    { label: c.best, value: fill(c.days, { n: r.streak.best }) },
    { label: c.freezes, value: String(r.streak.freezesLeft) },
    { label: c.bosses, value: String(r.bossesDefeated) },
    { label: c.clean, value: String(r.solvedClean) },
  ]
  return (
    <section aria-labelledby="record-title">
      <h2 id="record-title" className="mb-3 text-callout font-semibold text-ink">
        {c.record}
      </h2>
      <dl className="m-0 grid grid-cols-2 border-t border-line-strong">
        {items.map((item) => (
          <div
            key={item.label}
            className="border-b border-line py-4 odd:pr-4 even:border-l even:pl-4"
          >
            <dt className="text-footnote text-ink-muted">{item.label}</dt>
            <dd className="num m-0 mt-1 font-display text-title-2 text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default function Ranks() {
  const c = useCopy().ranks
  const ranks = useRanks()
  return (
    <Shell title={c.title} lead={c.lead}>
      <Loadable query={ranks} what={c.loading}>
        {(r) => (
          <div className="grid gap-10 px-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:gap-16 md:px-0">
            <section aria-label={c.ladder} className="border-t border-line-strong">
              <Ladder r={r} />
            </section>
            <Record r={r} />
          </div>
        )}
      </Loadable>
    </Shell>
  )
}
