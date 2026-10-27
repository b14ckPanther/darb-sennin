import { useId, type ReactNode } from 'react'
import { useCopy } from '../copy/copy'
import { cx } from '../lib/cx'

export type Severity = 'critical' | 'major' | 'minor' | 'nit'

interface FindingNoteProps {
  severity: Severity
  title: string
  evidence?: ReactNode
  children?: ReactNode
}

const titleClass: Record<Severity, string> = {
  critical: 'font-semibold text-fail-ink',
  major: 'font-semibold text-ink',
  minor: 'font-normal text-ink',
  nit: 'font-normal text-ink-muted',
}

/** A reviewer finding: severity by weight, then the claim, then the evidence it cites. */
export function FindingNote({ severity, title, evidence, children }: FindingNoteProps) {
  const copy = useCopy()
  const titleId = useId()
  return (
    <article
      aria-labelledby={titleId}
      data-severity={severity}
      className="grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-1 py-3 max-sm:grid-cols-1"
    >
      <p
        className={cx(
          'pt-0.5 text-footnote',
          severity === 'critical'
            ? 'font-semibold tracking-wide text-fail-ink uppercase'
            : severity === 'major'
              ? 'font-semibold text-ink'
              : 'text-ink-muted',
        )}
      >
        {copy.severity[severity]}
      </p>
      <div className="min-w-0">
        <h4 id={titleId} className={cx('text-body', titleClass[severity])}>
          {title}
        </h4>
        {children ? (
          <div className="mt-1 max-w-[65ch] text-callout text-ink-muted">{children}</div>
        ) : null}
        {evidence ? <div className="mt-2 flex flex-wrap gap-1.5">{evidence}</div> : null}
      </div>
    </article>
  )
}
