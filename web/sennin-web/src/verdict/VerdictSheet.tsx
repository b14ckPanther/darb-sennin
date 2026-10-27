import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react'
import type { CaseEvidence, CaseResult, Finding, Submission } from '../api/types'
import { BossHp } from '../components/BossHp'
import { Button } from '../components/Button'
import { ComplexityPlot } from '../components/ComplexityPlot'
import { EvidenceChip } from '../components/EvidenceChip'
import { FindingNote } from '../components/FindingNote'
import { Icon } from '../components/Icon'
import { PraiseLine } from '../components/PraiseLine'
import { ScoreBreakdown } from '../components/ScoreBreakdown'
import { Tag } from '../components/Tag'
import { TestRow } from '../components/TestRow'
import { fill, useCopy } from '../copy/copy'
import { duration, spring } from '../design/motion'
import { cx } from '../lib/cx'
import { formatMs, formatWhen, languageName } from '../lib/format'
import { useReduceMotion } from '../lib/motion'

/** Where a live sheet is: cases resolving, then the grade, then the review. */
export type Phase = 'queued' | 'running' | 'graded' | 'reviewed'

interface VerdictSheetProps {
  submission: Submission
  /** Live runs pass the cases resolved so far; stored sheets omit it. */
  liveCases?: (CaseResult | null)[]
  phase?: Phase
  /** Lines lit while an evidence chip is hovered or focused. */
  onHighlightLines: (range: [number, number] | null) => void
  /** "Show in code" and line chips: bring the lines into view in the code. */
  onShowLines: (range: [number, number]) => void
  onTryAgain?: () => void
  /** Drawn above the sheet header, for the translation banner. */
  banner?: ReactNode
  compact?: boolean
}

/** Splits on commas, brackets and whitespace so the first differing token can be marked. */
function tokens(text: string): string[] {
  return text.split(/(?=[,[\]\s])|(?<=[,[\]\s])/)
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
      <dd className="m-0 font-mono text-callout break-all whitespace-pre-wrap text-ink">
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

function EvidenceCard({
  evidence,
  lines,
  onShow,
}: {
  evidence: CaseEvidence
  lines?: [number, number]
  onShow: (r: [number, number]) => void
}) {
  const c = useCopy().screens.verdict
  return (
    <div className="ml-8 space-y-3 border-l border-fail-mark pl-4 max-sm:ml-0">
      {evidence.input !== null ? (
        <div>
          <p className="text-footnote text-ink-muted">{c.input}</p>
          <pre
            tabIndex={0}
            aria-label={c.input}
            className="mt-1 max-h-40 overflow-auto rounded-control bg-surface-sunk p-3 text-footnote whitespace-pre-wrap text-ink"
          >
            {evidence.input}
          </pre>
        </div>
      ) : (
        <p className="text-footnote text-ink-muted">{c.bossHidden}</p>
      )}
      {evidence.inputSize ? (
        <p className="num text-callout text-ink">
          <span className="text-footnote text-ink-muted">{c.inputSize} </span>
          {evidence.inputSize}
        </p>
      ) : null}
      {evidence.expected !== null && evidence.actual !== null ? (
        <dl className="space-y-1.5">
          <Diff
            label={c.expected}
            text={evidence.expected}
            markAt={evidence.diffAt}
            tone="expected"
          />
          <Diff label={c.actual} text={evidence.actual} markAt={evidence.diffAt} tone="actual" />
        </dl>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="sr-only">{c.caseTags}</span>
        {evidence.tags.map((tag) => (
          <Tag key={tag} tone="weak">
            {tag}
          </Tag>
        ))}
        {lines ? (
          <Button
            variant="quiet"
            icon="code"
            onClick={() => {
              onShow(lines)
            }}
            className="ml-auto min-h-9 px-3"
          >
            {c.showInCode}
          </Button>
        ) : null}
      </div>
    </div>
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

/** A line under a heading saying what is still happening, in words (never a bare spinner). */
function Waiting({ text }: { text: string }) {
  return (
    <p className="flex items-center gap-2 text-callout text-ink-muted">
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full bg-pending-mark motion-safe:animate-pulse"
      />
      {text}
    </p>
  )
}

function Appear({ show, children }: { show: boolean; children: ReactNode }) {
  const reduce = useReduceMotion()
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce ? { duration: 0 } : { ...spring.ui, opacity: { duration: duration.state } }
          }
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function liveSummary(
  cases: (CaseResult | null)[],
  last: number,
  copy: ReturnType<typeof useCopy>,
): string {
  const c = copy.screens.verdict
  const done = cases.filter((x) => x !== null)
  const passed = done.filter((x) => x.status === 'pass').length
  const latest = cases[last]
  const n = String(last + 1).padStart(2, '0')
  if (done.length === cases.length) return fill(c.liveDone, { total: cases.length, passed })
  if (latest?.status === 'fail') return fill(c.liveFail, { n, passed })
  if (latest?.status === 'limit') return fill(c.liveLimit, { n, passed })
  return fill(copy.verdict.ledgerProgress, { done: done.length, total: cases.length })
}

/**
 * The signature (docs/UI_DESIGN.md section 1): ruled header, test ledger resolving case by case,
 * the first failure opening into evidence, the complexity plate, findings, and the score last.
 */
export function VerdictSheet({
  submission: s,
  liveCases,
  phase = 'reviewed',
  onHighlightLines,
  onShowLines,
  onTryAgain,
  banner,
  compact = false,
}: VerdictSheetProps) {
  const copy = useCopy()
  const c = copy.screens.verdict
  const reduce = useReduceMotion()
  const cases: (CaseResult | null)[] = liveCases ?? s.cases
  const done = cases.filter((x) => x !== null).length
  const firstFail = cases.findIndex((x) => x?.status === 'fail')
  const lastResolved = cases.reduce((last, x, i) => (x ? i : last), -1)
  const graded = phase === 'graded' || phase === 'reviewed'
  const reviewed = phase === 'reviewed' || (graded && s.findings === null)
  const findingsRef = useRef<HTMLDivElement>(null)

  // J/K walk the findings, E jumps to the current finding's first evidence (UI_DESIGN.md 3).
  const onFindingsKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key.toLowerCase()
    const notes = [...(findingsRef.current?.querySelectorAll<HTMLElement>('[data-finding]') ?? [])]
    const at = notes.findIndex((n) => n.contains(document.activeElement))
    if (key === 'j' || key === 'k') {
      event.preventDefault()
      const next = notes[Math.min(notes.length - 1, Math.max(0, at + (key === 'j' ? 1 : -1)))]
      next?.focus()
    } else if (key === 'e' && at >= 0) {
      event.preventDefault()
      notes[at]?.querySelector<HTMLButtonElement>('[data-target]')?.click()
    }
  }

  const jump = (target: string, lines?: [number, number]) => {
    if (lines) {
      onShowLines(lines)
      return
    }
    const el = document.getElementById(target)
    el?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    // Move focus with the eye, so Enter on a chip lands keyboard users at the evidence too.
    el?.focus({ preventScroll: true })
    el?.setAttribute('data-flash', 'true')
    window.setTimeout(() => el?.removeAttribute('data-flash'), 1200)
  }

  const chip = (f: Finding) =>
    f.evidence.map((e) => (
      <EvidenceChip
        key={e.target + e.label}
        kind={e.kind}
        label={e.label}
        target={e.target}
        onJump={() => {
          jump(e.target, e.lines)
        }}
        onHighlight={(target) => {
          onHighlightLines(target && e.lines ? e.lines : null)
          if (e.kind !== 'lines') {
            const el = document.getElementById(e.target)
            if (target) el?.setAttribute('data-lit', 'true')
            else el?.removeAttribute('data-lit')
          }
        }}
      />
    ))

  useEffect(
    () => () => {
      onHighlightLines(null)
    },
    [onHighlightLines],
  )

  return (
    <article
      aria-labelledby="sheet-title"
      className={cx(
        'min-w-0 bg-surface',
        !compact && 'rounded-panel border border-line px-5 pt-6 pb-8 shadow-raised lg:px-8',
      )}
    >
      {banner}
      <header className="pb-5">
        <h1
          id="sheet-title"
          className={cx(
            'font-display tracking-display text-ink',
            compact ? 'text-title-2' : 'text-title-1 lg:text-large-title',
          )}
        >
          {s.problemTitle}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-footnote text-ink-muted">
          <span>{languageName(s.language)}</span>
          <span>{fill(c.submitted, { when: formatWhen(s.createdAt) })}</span>
          <span>{fill(c.version, { version: s.contentVersion })}</span>
        </p>
      </header>
      <div className="space-y-8">
        <Section
          id="ledger"
          title={c.ledger}
          aside={
            <span className="num text-footnote text-ink-muted">
              {fill(copy.verdict.ledgerProgress, { done, total: cases.length })}
            </span>
          }
        >
          <p role="status" aria-live="polite" className="sr-only">
            {liveCases
              ? phase === 'queued'
                ? c.queued
                : liveSummary(cases, lastResolved, copy)
              : ''}
          </p>
          {s.isBoss ? (
            <div className="mb-4">
              <BossHp
                total={cases.length}
                fallen={cases.filter((x) => x?.status === 'pass').length}
                label={fill(copy.boss.hpLabel, {
                  remaining: cases.length - cases.filter((x) => x?.status === 'pass').length,
                  total: cases.length,
                })}
              />
            </div>
          ) : null}
          {phase === 'queued' ? (
            <div className="mb-3">
              <Waiting text={c.queued} />
            </div>
          ) : null}
          <ol aria-label={copy.verdict.ledgerLabel} className="m-0 list-none p-0">
            {cases.map((item, i) => {
              const id = `case-${String(i + 1).padStart(2, '0')}`
              const evidence = i === firstFail ? item?.evidence : undefined
              return (
                <TestRow
                  key={id}
                  id={id}
                  index={i + 1}
                  status={item?.status ?? 'pending'}
                  time={item ? formatMs(item.timeMs) : undefined}
                >
                  {evidence ? (
                    <motion.div
                      initial={reduce || !liveCases ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={reduce ? { duration: 0 } : spring.ui}
                      className="overflow-hidden"
                    >
                      <EvidenceCard evidence={evidence} lines={item?.lines} onShow={onShowLines} />
                    </motion.div>
                  ) : null}
                </TestRow>
              )
            })}
          </ol>
        </Section>

        {graded ? null : phase === 'running' && done === cases.length ? (
          <Waiting text={c.grading} />
        ) : null}

        <Appear show={graded}>
          <Section id="probe" title={c.complexity}>
            <div
              tabIndex={-1}
              className="max-w-md rounded-control outline-none data-[flash=true]:bg-highlight data-[lit=true]:bg-highlight"
            >
              {s.probe.skipped !== undefined ? (
                <ComplexityPlot skipped={s.probe.skipped} />
              ) : (
                <ComplexityPlot points={s.probe.points} fit={s.probe.fit} target={s.probe.target} />
              )}
            </div>
          </Section>
        </Appear>

        {graded && !reviewed ? <Waiting text={c.reviewing} /> : null}

        <Appear show={reviewed}>
          <Section
            title={c.findings}
            aside={
              s.findings && s.findings.length > 1 ? (
                <span className="text-footnote text-ink-muted max-md:hidden">{c.findingsKeys}</span>
              ) : null
            }
          >
            {s.findings === null ? (
              <p className="flex items-start gap-2 border-y border-line py-3 text-callout text-ink">
                <Icon name="info" size={18} className="mt-0.5 shrink-0 text-limit-mark" />
                {copy.states.reviewerDown.body}
              </p>
            ) : s.findings.length === 0 ? (
              <p className="text-callout text-ink-muted">{c.noFindings}</p>
            ) : (
              <div ref={findingsRef} onKeyDown={onFindingsKey} className="divide-y divide-line">
                {s.findings.map((f) => (
                  <div
                    key={f.id}
                    data-finding
                    tabIndex={-1}
                    className="rounded-control outline-offset-4"
                  >
                    <FindingNote severity={f.severity} title={f.title} evidence={chip(f)}>
                      {f.body}
                    </FindingNote>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </Appear>

        <Appear show={reviewed}>
          <Section title={c.score}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <ScoreBreakdown score={s.score} max={s.maxScore} parts={s.scoreParts} />
              {onTryAgain ? (
                <Button variant="secondary" icon="retry" onClick={onTryAgain}>
                  {c.tryAgain}
                </Button>
              ) : null}
            </div>
            {s.praise ? (
              <div className="mt-6">
                <PraiseLine earned text={s.praise} />
              </div>
            ) : null}
          </Section>
        </Appear>
      </div>
    </article>
  )
}
