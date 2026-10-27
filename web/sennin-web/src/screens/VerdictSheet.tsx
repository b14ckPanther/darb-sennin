import { useId, useState, type ReactNode } from 'react'
import { Button } from '../components/Button'
import { ComplexityPlot } from '../components/ComplexityPlot'
import { EvidenceChip, type EvidenceKind } from '../components/EvidenceChip'
import { FindingNote, type Severity } from '../components/FindingNote'
import { Icon } from '../components/Icon'
import { PraiseLine } from '../components/PraiseLine'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { Tag } from '../components/Tag'
import { TestRow, type CaseStatus } from '../components/TestRow'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { useMediaQuery } from '../lib/useMediaQuery'
import { Brand, DemoBanner } from './chrome'
import { seed } from './seed'

interface Evidence {
  input: string
  expected: string
  actual: string
  diffAt: number
  tags: string[]
}

interface CaseView {
  status: CaseStatus
  time?: string
  evidence?: Evidence
}

interface Finding {
  severity: Severity
  title: string
  body: string
  evidence: { kind: EvidenceKind; label: string; target: string }[]
}

interface SheetView {
  problem: string
  language: string
  submittedAt: string
  code: string[]
  bracket: [number, number] | null
  cases: CaseView[]
  probe: typeof seed.verdict.probe
  findings: Finding[]
  score: typeof seed.verdict.score
  praise: string | null
}

function view(earned: boolean): SheetView {
  const v = seed.verdict
  if (earned) {
    const e = v.earned
    return {
      problem: e.problem,
      language: e.language,
      submittedAt: e.submittedAt,
      code: e.code,
      bracket: null,
      cases: Array.from({ length: e.caseCount }, (_, i) => ({
        status: 'pass' as const,
        time: `${String(9 + (i % 4))} ms`,
      })),
      probe: e.probe,
      findings: e.findings as Finding[],
      score: e.score,
      praise: e.praise,
    }
  }
  const [from, to] = v.highlightLines
  return {
    problem: v.problem,
    language: v.language,
    submittedAt: v.submittedAt,
    code: v.code,
    bracket: from !== undefined && to !== undefined ? [from, to] : null,
    cases: v.cases as CaseView[],
    probe: v.probe,
    findings: v.findings as Finding[],
    score: v.score,
    praise: null,
  }
}

/** Splits on commas and brackets so the first differing token can be marked. */
function tokens(text: string): string[] {
  return text.split(/(?=[,[\]])|(?<=[,[\]])/)
}

function Diff({
  label,
  text,
  markAt,
  tone,
}: {
  label: string
  text: string
  markAt: number
  tone: 'expected' | 'actual'
}) {
  return (
    <div className="grid grid-cols-[7rem_1fr] items-baseline gap-3 max-sm:grid-cols-1 max-sm:gap-1">
      <dt className="text-footnote text-ink-muted">{label}</dt>
      <dd className="m-0 font-mono text-callout break-all text-ink">
        {tokens(text).map((token, i) => (
          <span
            key={`${String(i)}${token}`}
            className={cx(
              i === markAt &&
                tone === 'actual' &&
                'rounded-[3px] bg-fail-wash px-0.5 text-fail-ink underline decoration-fail-mark decoration-2 underline-offset-4',
              i === markAt && tone === 'expected' && 'rounded-[3px] bg-highlight px-0.5',
            )}
          >
            {token}
          </span>
        ))}
      </dd>
    </div>
  )
}

function EvidenceCard({ evidence, onShowCode }: { evidence: Evidence; onShowCode: () => void }) {
  const copy = useCopy().screens.verdict
  return (
    <div className="ml-8 space-y-3 border-l border-fail-mark pl-4 max-sm:ml-0">
      <div>
        <p className="text-footnote text-ink-muted">{copy.input}</p>
        <pre
          tabIndex={0}
          aria-label={copy.input}
          className="mt-1 max-h-40 overflow-auto rounded-control bg-surface-sunk p-3 text-footnote text-ink"
        >
          {evidence.input}
        </pre>
      </div>
      <dl className="space-y-1.5">
        <Diff
          label={copy.expected}
          text={evidence.expected}
          markAt={evidence.diffAt}
          tone="expected"
        />
        <Diff label={copy.actual} text={evidence.actual} markAt={evidence.diffAt} tone="actual" />
      </dl>
      <div className="flex flex-wrap items-center gap-1.5">
        {evidence.tags.map((tag) => (
          <Tag key={tag} tone="weak">
            {tag}
          </Tag>
        ))}
        <Button variant="quiet" icon="code" onClick={onShowCode} className="ml-auto min-h-9 px-3">
          {copy.showInCode}
        </Button>
      </div>
    </div>
  )
}

function lineRange(target: string, findings: Finding[]): [number, number] | null {
  const match = /^code-line-(\d+)$/.exec(target)
  if (!match?.[1]) {
    return null
  }
  const start = Number(match[1])
  const chip = findings.flatMap((f) => f.evidence).find((e) => e.target === target)
  const range = chip ? /(\d+)-(\d+)/.exec(chip.label) : null
  return range?.[2] ? [start, Number(range[2])] : [start, start]
}

function CodePanel({
  code,
  bracket,
  lit,
  open,
  onToggle,
}: {
  code: string[]
  bracket: [number, number] | null
  lit: [number, number] | null
  open: boolean
  onToggle: (open: boolean) => void
}) {
  const copy = useCopy().screens.verdict
  const inRange = (n: number, r: [number, number] | null) => r !== null && n >= r[0] && n <= r[1]
  return (
    <details
      open={open}
      onToggle={(event) => {
        onToggle(event.currentTarget.open)
      }}
      className="group rounded-panel border border-line bg-surface-sunk lg:sticky lg:top-20 lg:[&>summary]:hidden"
    >
      <summary className="flex min-h-touch cursor-pointer list-none items-center justify-between px-4 text-callout font-medium text-ink">
        {copy.code}
        <Icon
          name="chevron-down"
          size={18}
          className="text-ink-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <pre
        tabIndex={0}
        aria-label={copy.code}
        className="overflow-x-auto py-3 text-footnote leading-6"
      >
        {code.map((line, i) => {
          const n = i + 1
          return (
            <span
              key={n}
              id={`code-line-${String(n)}`}
              className={cx(
                'relative grid scroll-mt-28 grid-cols-[2.5rem_1fr] pr-4 transition-colors duration-(--duration-state)',
                inRange(n, lit) && 'bg-highlight',
              )}
            >
              <span
                aria-hidden="true"
                className={cx(
                  'num pr-3 text-right text-ink-muted select-none',
                  inRange(n, bracket) && 'text-fail-ink',
                )}
              >
                {n}
              </span>
              {inRange(n, bracket) ? (
                <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-fail-mark" />
              ) : null}
              <code className="whitespace-pre text-ink">{line || ' '}</code>
            </span>
          )
        })}
      </pre>
    </details>
  )
}

function Section({
  title,
  aside,
  children,
  id,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
  id?: string
}) {
  const headingId = useId()
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="scroll-mt-24 border-t border-line-strong pt-5"
    >
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id={headingId} className="font-display text-title-3 text-ink">
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** The signature: evidence first, judgement last (docs/UI_DESIGN.md section 1). Static comp on demo data. */
export function VerdictSheet({ earned = false }: { earned?: boolean }) {
  const copy = useCopy()
  const c = copy.screens.verdict
  const data = view(earned)
  const [lit, setLit] = useState<[number, number] | null>(null)
  const [codeOpen, setCodeOpen] = useState(false)
  // Desktop shows the code beside the sheet (UI_DESIGN.md 1.1); phones fold it under the sheet.
  const wide = useMediaQuery('(min-width: 64rem)')
  const done = data.cases.filter((x) => x.status !== 'pending').length
  const firstFail = data.cases.findIndex((x) => x.status === 'fail')

  const highlight = (target: string | null) => {
    setLit(target ? lineRange(target, data.findings) : null)
  }
  const jump = (target: string) => {
    const range = lineRange(target, data.findings)
    if (range) {
      setCodeOpen(true)
      setLit(range)
    }
    requestAnimationFrame(() => {
      const el = document.getElementById(target)
      el?.scrollIntoView({
        block: 'center',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      })
    })
  }

  return (
    <div className="min-h-dvh">
      <header className="material-bar sticky top-0 z-30 border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-4 px-4 lg:px-8">
          <Brand />
          <DemoBanner />
        </div>
      </header>
      <main className="mx-auto grid max-w-[1320px] grid-cols-[minmax(0,1fr)] gap-6 px-4 pt-6 pb-16 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)] lg:gap-10 lg:px-8">
        <div className="order-2 min-w-0 lg:order-1">
          <CodePanel
            code={data.code}
            bracket={data.bracket}
            lit={lit}
            open={wide || codeOpen}
            onToggle={setCodeOpen}
          />
        </div>
        <article
          aria-labelledby="sheet-title"
          className="order-1 min-w-0 rounded-panel border border-line bg-surface px-5 pt-6 pb-8 shadow-raised lg:order-2 lg:px-8"
        >
          <header className="pb-5">
            <h1
              id="sheet-title"
              className="font-display text-title-1 tracking-display text-ink lg:text-large-title"
            >
              {data.problem}
            </h1>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-footnote text-ink-muted">
              <span>{data.language}</span>
              <span>{fill(c.submitted, { when: data.submittedAt })}</span>
              <span>{fill(c.version, { version: seed.verdict.contentVersion })}</span>
            </p>
          </header>
          <div className="space-y-8">
            <Section
              title={c.ledger}
              aside={
                <span className="num text-footnote text-ink-muted">
                  {fill(copy.verdict.ledgerProgress, { done, total: data.cases.length })}
                </span>
              }
            >
              <ol
                aria-live="polite"
                aria-label={copy.verdict.ledgerLabel}
                className="m-0 list-none p-0"
              >
                {data.cases.map((item, i) => {
                  const id = `case-${String(i + 1).padStart(2, '0')}`
                  return (
                    <TestRow key={id} id={id} index={i + 1} status={item.status} time={item.time}>
                      {i === firstFail && item.evidence ? (
                        <EvidenceCard
                          evidence={item.evidence}
                          onShowCode={() => {
                            const range = data.bracket
                            if (range) {
                              jump(`code-line-${String(range[0])}`)
                              setLit(range)
                            }
                          }}
                        />
                      ) : null}
                    </TestRow>
                  )
                })}
              </ol>
            </Section>
            <Section id="probe" title={c.complexity}>
              <div className="max-w-md">
                <ComplexityPlot
                  points={data.probe.points}
                  fit={data.probe.fit}
                  target={data.probe.target}
                />
              </div>
            </Section>
            <Section title={c.findings}>
              <div className="divide-y divide-line">
                {data.findings.map((f) => (
                  <FindingNote
                    key={f.title}
                    severity={f.severity}
                    title={f.title}
                    evidence={f.evidence.map((e) => (
                      <EvidenceChip
                        key={e.target + e.label}
                        kind={e.kind}
                        label={e.label}
                        target={e.target}
                        onJump={jump}
                        onHighlight={highlight}
                      />
                    ))}
                  >
                    {f.body}
                  </FindingNote>
                ))}
              </div>
            </Section>
            <Section title={c.score}>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <ScoreBreakdown
                  score={data.score.value}
                  max={data.score.max}
                  parts={data.score.parts}
                />
                <Button variant="secondary" icon="retry">
                  {c.tryAgain}
                </Button>
              </div>
              {data.praise ? (
                <div className="mt-6">
                  <PraiseLine earned text={data.praise} />
                </div>
              ) : null}
            </Section>
          </div>
        </article>
      </main>
    </div>
  )
}
