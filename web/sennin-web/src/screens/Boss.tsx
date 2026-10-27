import { useBoss, useSubmission } from '../api/queries'
import type { BossWeek } from '../api/types'
import { Shell } from '../app/Shell'
import { Button } from '../components/Button'
import { BossHp } from '../components/BossHp'
import { Icon } from '../components/Icon'
import { Loadable } from '../components/Loadable'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { formatDay, formatShortDay } from '../lib/format'
import { navigate } from '../lib/router'

function BossBody({ boss }: { boss: BossWeek }) {
  const c = useCopy().boss
  const last = useSubmission(boss.lastSubmissionId)
  const remaining = boss.total - boss.fallen
  return (
    <div className="px-4 md:px-0">
      <section
        aria-labelledby="boss-title"
        className="border-b border-line-strong pt-6 pb-10 md:pt-14 md:pb-16"
      >
        <p className="text-footnote font-medium text-ink-muted">{c.eyebrow}</p>
        <h1
          id="boss-title"
          className="mt-2 max-w-[14ch] font-display text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.95] tracking-display text-ink"
        >
          {boss.title}
        </h1>
        <p className="mt-5 max-w-[46ch] font-display text-title-3 text-ink-muted md:text-title-2">
          {boss.line}
        </p>

        <div className="mt-10 md:mt-14">
          <BossHp
            size="large"
            total={boss.total}
            fallen={boss.fallen}
            label={fill(c.hpLabel, { remaining, total: boss.total })}
          />
          <p className="num mt-3 flex flex-wrap justify-between gap-2 text-callout text-ink">
            <span>{fill(c.hp, { remaining, total: boss.total })}</span>
            <span className="text-ink-muted">{fill(c.days, { days: boss.daysLeft })}</span>
          </p>
        </div>

        <p className="mt-6 text-callout text-ink">
          {boss.defeatedAt
            ? fill(c.defeated, { when: formatDay(boss.defeatedAt) })
            : fill(c.unbeaten, { passed: boss.fallen, total: boss.total })}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            icon="boss"
            onClick={() => {
              navigate(`/problems/${boss.problemId}`)
            }}
          >
            {c.attempt}
          </Button>
          {boss.lastSubmissionId ? (
            <Button
              variant="secondary"
              icon="statement"
              onClick={() => {
                navigate(`/submissions/${boss.lastSubmissionId ?? ''}`)
              }}
            >
              {c.lastAttempt}
            </Button>
          ) : null}
        </div>
        {last.data ? (
          <p className="mt-3 text-footnote text-ink-muted">
            {fill(c.lastLine, {
              when: formatShortDay(last.data.createdAt),
              score: last.data.score,
              max: last.data.maxScore,
            })}
          </p>
        ) : null}
      </section>

      <div className="grid gap-10 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
        <div className="space-y-4">
          <p className="max-w-[56ch] text-callout text-ink">{c.rules}</p>
          <p className="flex max-w-[56ch] items-start gap-2 text-footnote text-ink-muted">
            <Icon name="hide" size={16} className="mt-px shrink-0" />
            {c.inputsHidden}
          </p>
        </div>
        <section aria-labelledby="record-title">
          <h2 id="record-title" className="mb-3 text-callout font-semibold text-ink">
            {c.record}
          </h2>
          <ol className="m-0 list-none border-t border-line p-0">
            {boss.record.map((r) => (
              <li
                key={r.weekOf}
                className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 border-b border-line py-3 text-callout"
              >
                <span className="num text-footnote text-ink-muted">{formatShortDay(r.weekOf)}</span>
                <span className={cx(r.defeated ? 'text-ink' : 'text-ink-muted')}>
                  <span className="sr-only">
                    {r.defeated ? c.recordDefeated : c.recordUnbeaten}.{' '}
                  </span>
                  {r.text}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

/** Full-bleed boss page: the title set large, health as one segment per hidden case. */
export default function Boss() {
  const c = useCopy().boss
  const boss = useBoss()
  return (
    <Shell title={c.title} variant="full">
      <div className="mx-auto max-w-[1180px] md:px-8">
        <Loadable query={boss} what={c.loading}>
          {(data) => <BossBody boss={data} />}
        </Loadable>
      </div>
    </Shell>
  )
}
