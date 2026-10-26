import { useId } from 'react'
import { fill, useCopy } from '../copy/copy'

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

/** The score, shown last. Its breakdown opens on hover or focus and is always read by screen readers. */
export function ScoreBreakdown({ score, max, parts }: ScoreBreakdownProps) {
  const copy = useCopy()
  const breakdownId = useId()
  return (
    <div className="group relative inline-block">
      <button
        type="button"
        aria-describedby={breakdownId}
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
        className="pointer-events-none absolute top-full left-0 z-10 mt-2 w-max max-w-72 rounded-control border border-line bg-surface p-3 opacity-0 shadow-raised transition-opacity duration-(--duration-state) group-focus-within:opacity-100 group-hover:opacity-100"
      >
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
  )
}
