import { useId, useState, type ReactNode } from 'react'
import { Icon } from '../components/Icon'
import { LargeTitle } from '../components/LargeTitle'
import { ListRow } from '../components/ListRow'
import { TabBar, type TabItem } from '../components/TabBar'
import { Tag } from '../components/Tag'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { Brand, DemoBanner } from './chrome'
import { seed } from './seed'

type DayState = 'done' | 'frozen' | 'today' | 'ahead' | 'missed'

/**
 * One day of the streak, drawn as a small open ensō: practice is a circle that is never closed
 * (brand/README.md). Graded days are a full stroke, a freeze is a thin one, days ahead are dotted.
 */
function DayMark({ state }: { state: DayState }) {
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
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className={cx('border-t border-line-strong pt-4', className)}>
      <h2 id={id} className="mb-3 text-callout font-semibold text-ink">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Difficulty({ level, max, label }: { level: number; max: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex items-end gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((step) => (
        <span
          key={step}
          className={cx('w-1 rounded-[1px]', step <= level ? 'bg-ink-muted' : 'bg-line')}
          style={{ height: `${String(4 + step * 3)}px` }}
        />
      ))}
    </span>
  )
}

/** Home: one primary action, then the week, the boss and three reasons to practise. Demo data. */
export function Today() {
  const copy = useCopy()
  const t = copy.screens.today
  const data = seed.today
  const [tab, setTab] = useState('today')
  const tabs: TabItem[] = [
    { id: 'today', label: copy.screens.tabs.today, icon: 'today' },
    { id: 'library', label: copy.screens.tabs.library, icon: 'library' },
    { id: 'boss', label: copy.screens.tabs.boss, icon: 'boss' },
    { id: 'profile', label: copy.screens.tabs.profile, icon: 'profile' },
  ]
  const fallen = data.boss.total - data.boss.remaining

  return (
    <div className="min-h-dvh pb-24 md:pb-12">
      <div className="material-bar sticky top-0 z-30 hidden border-b border-line md:block">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-6 px-8">
          <Brand />
          <nav aria-label={copy.screens.tabs.label}>
            <ul className="flex gap-1">
              {tabs.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={tab === item.id ? 'page' : undefined}
                    onClick={() => {
                      setTab(item.id)
                    }}
                    className={cx(
                      'min-h-9 rounded-control px-3 text-callout font-medium',
                      tab === item.id
                        ? 'bg-surface-sunk text-ink'
                        : 'text-ink-muted hover:text-ink',
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <DemoBanner />
        </div>
      </div>

      <main className="mx-auto max-w-[1120px] md:px-4 md:pt-6">
        <div className="md:hidden">
          <LargeTitle title={t.title} trailing={<DemoBanner />}>
            <p className="text-callout text-ink-muted">{data.greeting}</p>
          </LargeTitle>
        </div>
        <header className="hidden px-4 pb-6 md:block">
          <p className="text-callout text-ink-muted">{data.greeting}</p>
          <h1 className="font-display text-large-title tracking-display text-ink">{t.title}</h1>
        </header>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-8 px-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] md:gap-12">
          <div className="min-w-0 space-y-8">
            <section
              aria-labelledby="continue-title"
              className="rounded-panel bg-primary px-5 py-6 text-primary-ink md:px-7 md:py-8"
            >
              <p className="text-footnote opacity-80">{t.continue}</p>
              <h2 id="continue-title" className="mt-1 font-display text-title-1 tracking-display">
                {data.continue.title}
              </h2>
              <p className="mt-1 text-callout opacity-80">{data.continue.detail}</p>
              <button
                type="button"
                className="mt-5 inline-flex min-h-touch items-center gap-2 rounded-control bg-primary-ink px-5 text-callout font-medium text-primary transition-transform duration-(--duration-micro) active:scale-[0.97]"
              >
                {t.continue}
                <Icon name="chevron-right" size={18} />
              </button>
            </section>

            <Block title={t.recommended}>
              <ul className="m-0 list-none overflow-hidden rounded-panel border border-line p-0">
                {data.recommended.map((p) => (
                  <ListRow
                    key={p.title}
                    title={p.title}
                    subtitle={p.reason}
                    trailing={
                      <Difficulty
                        level={p.difficulty}
                        max={data.difficultyMax}
                        label={fill(t.difficulty, { n: p.difficulty, max: data.difficultyMax })}
                      />
                    }
                    onSelect={() => undefined}
                    actions={[
                      { id: 'pin', label: t.pin, icon: 'pin', onAction: () => undefined },
                      { id: 'hide', label: t.hide, icon: 'hide', onAction: () => undefined },
                    ]}
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
                    <DayMark state={state as DayState} />
                    <span
                      className={cx(
                        'text-caption',
                        state === 'today' ? 'font-semibold text-ink' : 'text-ink-muted',
                      )}
                    >
                      {data.streak.weekLabels[i]}
                    </span>
                    <span className="sr-only">{t.week[state as DayState]}</span>
                  </li>
                ))}
              </ol>
            </Block>

            <Block title={t.boss}>
              <h3 className="font-display text-title-2 text-ink">{data.boss.title}</h3>
              <p className="mt-1 text-callout text-ink-muted">{data.boss.line}</p>
              <div
                role="img"
                aria-label={fill(t.bossHp, {
                  remaining: data.boss.remaining,
                  total: data.boss.total,
                })}
                className="mt-4 grid gap-[3px]"
                style={{
                  gridTemplateColumns: `repeat(${String(data.boss.total)}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: data.boss.total }, (_, i) => (
                  <span
                    key={i}
                    className={cx(
                      'h-3 rounded-[2px]',
                      i < fallen ? 'border border-dashed border-line-strong' : 'bg-ink',
                    )}
                  />
                ))}
              </div>
              <p className="num mt-2 flex justify-between text-footnote text-ink-muted">
                <span>
                  {fill(t.bossHp, { remaining: data.boss.remaining, total: data.boss.total })}
                </span>
                <span>{fill(t.bossDays, { days: data.boss.daysLeft })}</span>
              </p>
            </Block>

            <Block title={t.rank}>
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-display text-title-2 text-ink">{data.rank.name}</p>
                <p className="num text-callout text-ink">{data.rank.points.toLocaleString('en')}</p>
              </div>
              <p className="num mt-1 text-footnote text-ink-muted">
                {fill(t.toNext, {
                  left: data.rank.nextAt - data.rank.points,
                  next: data.rank.next,
                })}
              </p>
            </Block>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
        <TabBar label={copy.screens.tabs.label} items={tabs} activeId={tab} onSelect={setTab} />
      </div>
    </div>
  )
}
