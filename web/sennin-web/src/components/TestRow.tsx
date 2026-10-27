import type { ReactNode } from 'react'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { Icon, type IconName } from './Icon'

export type CaseStatus = 'pending' | 'pass' | 'fail' | 'limit'

const statusIcon: Record<CaseStatus, IconName> = {
  pending: 'pending',
  pass: 'pass',
  fail: 'fail',
  limit: 'limit',
}

const markClass: Record<CaseStatus, string> = {
  pending: 'text-pending-mark',
  pass: 'text-pass-mark',
  fail: 'text-fail-mark',
  limit: 'text-limit-mark',
}

const wordClass: Record<CaseStatus, string> = {
  pending: 'text-ink-muted',
  pass: 'text-pass-ink',
  fail: 'text-fail-ink font-medium',
  limit: 'text-limit-ink font-medium',
}

interface TestRowProps {
  id: string
  index: number
  status: CaseStatus
  time?: string
  /** Evidence card shown under the row, usually for the first failure. */
  children?: ReactNode
}

/** One line of the test ledger. Status is a mark, a word and a rule, never colour alone. */
export function TestRow({ id, index, status, time, children }: TestRowProps) {
  const copy = useCopy()
  const label = fill(copy.verdict.caseLabel, { n: String(index).padStart(2, '0') })
  return (
    <li
      id={id}
      data-status={status}
      className={cx(
        'scroll-mt-24 border-b',
        status === 'fail' ? 'border-fail-mark' : 'border-line',
        status === 'pending' && 'border-dashed',
      )}
    >
      <div className="grid min-h-10 grid-cols-[1.25rem_1fr_auto] items-center gap-3 py-2 text-callout">
        <Icon
          name={statusIcon[status]}
          filled={status !== 'pending'}
          size={18}
          className={markClass[status]}
        />
        <span className="flex items-baseline gap-3">
          <span className="num text-ink">{label}</span>
          <span className={wordClass[status]}>{copy.verdict[status]}</span>
        </span>
        <span className="num text-footnote text-ink-muted">{time}</span>
      </div>
      {children ? <div className="pb-4">{children}</div> : null}
    </li>
  )
}
