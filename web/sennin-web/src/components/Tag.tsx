import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

interface TagProps {
  /** `weak` marks a tag from the weakness profile. */
  tone?: 'neutral' | 'weak'
  children: ReactNode
}

export function Tag({ tone = 'neutral', children }: TagProps) {
  return (
    <span
      data-tone={tone}
      className={cx(
        'inline-flex items-center rounded-chip px-2 py-0.5 text-footnote',
        tone === 'weak' ? 'bg-fail-wash text-fail-ink' : 'bg-surface-sunk text-ink-muted',
      )}
    >
      {children}
    </span>
  )
}
