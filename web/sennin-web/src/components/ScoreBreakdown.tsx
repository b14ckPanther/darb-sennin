import { useId, useState, type KeyboardEvent } from 'react'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'

export interface ScorePart {
  label: string
  value: number
  max?: number
}

interface ScoreBreakdownProps {
  score: number
  max: number
  parts: ScorePart[]
}

function partText(part: ScorePart): string {
  return part.max === undefined
    ? `${part.label} ${String(part.value)}`
    : `${part.label} ${String(part.value)}/${String(part.max)}`
}

/**
 * The score, shown last. A disclosure: press (or tap) opens the breakdown, Escape or a second
 * press closes it, the pointer can rest on it, and screen readers always hear it (WCAG 1.4.13).
 */
export function ScoreBreakdown({ score, max, parts }: ScoreBreakdownProps) {
  const copy = useCopy()
  const breakdownId = useId()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const shown = open || hovered

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && shown) {
      event.stopPropagation()
      setOpen(false)
      setHovered(false)
    }
  }

  return (
    <div
      className="relative inline-block"
      onKeyDown={onKeyDown}
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={breakdownId}
        onClick={() => {
          setOpen(!open)
        }}
        className="flex items-baseline gap-2 rounded-control text-left"
      >
        <span className="sr-only">{copy.score.label}</span>
        <span className="num font-sans text-score font-medium tracking-tight text-ink">
          {score}
        </span>
        <span className="text-callout text-ink-muted">{fill(copy.score.outOf, { max })}</span>
      </button>
      <div
        id={breakdownId}
        role="note"
        className={cx(
          'absolute top-full left-0 z-10 w-max max-w-72 pt-2 transition-opacity duration-(--duration-state)',
          shown ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="rounded-control border border-line bg-surface p-3 shadow-raised">
          <p className="text-footnote text-ink-muted">{copy.score.breakdown}</p>
          <ul className="mt-1 space-y-0.5">
            {parts.map((part) => (
              <li key={part.label} className="num text-callout text-ink">
                {partText(part)}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
