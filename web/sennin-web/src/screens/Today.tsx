import { useId, type ReactNode } from 'react'
import { useToday } from '../api/queries'
import type { DayState, TodayView } from '../api/types'
import { Shell } from '../app/Shell'
import { Difficulty } from '../components/Difficulty'
import { Icon } from '../components/Icon'
import { ListRow } from '../components/ListRow'
import { Loadable } from '../components/Loadable'
import { Tag } from '../components/Tag'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { Link } from '../lib/Link'
import { navigate } from '../lib/router'

/**
 * One day of the streak, drawn as a small open ensō: practice is a circle that is never closed
 * (brand/README.md). Graded days are a full stroke, a freeze is a thin one, days ahead are dotted.
 */
export function DayMark({ state }: { state: DayState }) {
  const stroke = {
    done: 'stroke-primary',
    frozen: 'stroke-line-strong',
    today: 'stroke-primary',
    ahead: 'stroke-line-strong',
    missed: 'stroke-fail-mark',
  }[state]
  return (
    <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden="true">
      <path
        d="M19.2 7.6A9 9 0 1 0 21 12"
        fill="none"
        className={stroke}
        strokeLinecap="round"
        strokeWidth={state === 'done' ? 3 : state === 'today' ? 2 : 1.5}
        strokeDasharray={state === 'ahead' ? '1 3.2' : state === 'today' ? '4 2.4' : undefined}
      />
    </svg>
  )
}

function Block({
  title,
  children,
  action,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="border-t border-line-strong pt-4">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id={id} className="text-callout font-semibold text-ink">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function BossBar({
  total,
  fallen,
  label,
}: {
  total: number
  fallen: number
  label: string
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid gap-[3px]"
      style={{ gridTemplateColumns: `repeat(${String(total)}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cx(
            'h-3 rounded-[2px]',
            i < fallen ? 'border border-dashed border-line-strong' : 'bg-ink',
          )}
        />
      ))}
    </div>
  )
}

function Primary({ data }: { data: TodayView }) {
  const t = useCopy().screens.today
  const top = data.recommended[0]
  const target =
    data.continue ??
    (top ? { problemId: top.problemId, title: top.title, detail: top.reason } : null)
  if (!target) return null
  const label = data.continue ? t.continue : t.start
  return (
    <section
      aria-labelledby="primary-title"
      className="rounded-panel bg-primary px-5 py-6 text-primary-ink md:px-7 md:py-8"
    >
      <p className="text-footnote opacity-80">{label}</p>
      <h2 id="primary-title" className="mt-1 font-display text-title-1 tracking-display">
        {target.title}
      </h2>
      <p className="mt-1 text-callout opacity-80">{target.detail}</p>
      <Link
        href={`/problems/${target.problemId}`}
        className="mt-5 inline-flex min-h-touch items-center gap-2 rounded-control bg-primary-ink px-5 text-callout font-medium text-primary no-underline transition-transform duration-(--duration-micro) active:scale-[0.97]"
      >
        {label}
        <Icon name="chevron-right" size={18} />
      </Link>
    </section>
  )
}

function TodayBody({ data }: { data: TodayView }) {
  const copy = useCopy()
  const t = copy.screens.today
  const fallen = data.boss.total - data.boss.remaining
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 px-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-12 md:px-0">
      <div className="min-w-0 space-y-8">
        <Primary data={data} />
        <Block title={t.recommended}>
          <ul className="m-0 list-none overflow-hidden rounded-panel border border-line p-0">
            {data.recommended.map((p) => (
              <ListRow
                key={p.problemId}
                title={p.title}
                subtitle={p.reason}
                trailing={
                  <Difficulty
                    level={p.difficulty}
                    max={data.difficultyMax}
                    label={fill(t.difficulty, { n: p.difficulty, max: data.difficultyMax })}
                  />
                }
                onSelect={() => {
                  navigate(`/problems/${p.problemId}`)
                }}
              />
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[...new Set(data.recommended.flatMap((p) => p.tags))].map((tag) => (
              <Tag key={tag} tone={data.weakTags.includes(tag) ? 'weak' : 'neutral'}>
                {tag}
              </Tag>
            ))}
          </div>
        </Block>
      </div>

      <div className="min-w-0 space-y-8">
        <Block title={t.streak}>
          <p className="num font-display text-title-1 text-ink">
            {fill(t.streakDays, { days: data.streak.days })}
          </p>
          <ol className="mt-3 grid list-none grid-cols-7 gap-1 p-0">
            {data.streak.week.map((state, i) => (
              <li key={data.streak.weekLabels[i]} className="flex flex-col items-center gap-1">
                <DayMark state={state} />
                <span
                  className={cx(
                    'text-caption',
                    state === 'today' ? 'font-semibold text-ink' : 'text-ink-muted',
                  )}
                >
                  {data.streak.weekLabels[i]}
                </span>
                <span className="sr-only">{t.week[state]}</span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-footnote text-ink-muted">
            {fill(t.freezes, { n: data.streak.freezesLeft })}
          </p>
        </Block>

        <Block
          title={t.boss}
          action={
            <Link href="/boss" className="text-footnote text-ink-muted hover:text-ink">
              {t.openBoss}
            </Link>
          }
        >
          <h3 className="font-display text-title-2 text-ink">{data.boss.title}</h3>
          <p className="mt-1 mb-4 text-callout text-ink-muted">{data.boss.line}</p>
          <BossBar
            total={data.boss.total}
            fallen={fallen}
            label={fill(t.bossHp, { remaining: data.boss.remaining, total: data.boss.total })}
          />
          <p className="num mt-2 flex justify-between text-footnote text-ink-muted">
            <span>
              {fill(t.bossHp, { remaining: data.boss.remaining, total: data.boss.total })}
            </span>
            <span>{fill(t.bossDays, { days: data.boss.daysLeft })}</span>
          </p>
        </Block>

        <Block
          title={t.rank}
          action={
            <Link href="/ranks" className="text-footnote text-ink-muted hover:text-ink">
              {t.openRanks}
            </Link>
          }
        >
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-display text-title-2 text-ink">{data.rank.name}</p>
            <p className="num text-callout text-ink">{data.rank.points.toLocaleString('en')}</p>
          </div>
          {data.rank.next !== null && data.rank.nextAt !== null ? (
            <p className="num mt-1 text-footnote text-ink-muted">
              {fill(t.toNext, { left: data.rank.nextAt - data.rank.points, next: data.rank.next })}
            </p>
          ) : null}
        </Block>
      </div>
    </div>
  )
}

/** Home: one primary action, then the week, the boss and three reasons to practise. */
export function Today() {
  const copy = useCopy()
  const today = useToday()
  return (
    <Shell title={copy.screens.today.title} lead={today.data?.greeting}>
      <Loadable query={today} what={copy.screens.today.loading}>
        {(data) => <TodayBody data={data} />}
      </Loadable>
    </Shell>
  )
}
