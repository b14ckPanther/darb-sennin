import { m } from 'motion/react'
import { useCopy } from '../copy/copy'
import { spring } from '../design/motion'
import { useReduceMotion } from '../lib/motion'

interface PraiseLineProps {
  /** Result of the deterministic praise gate. False renders nothing: the absence is the message. */
  earned: boolean
  text: string
}

/**
 * The one place gold and vermilion meet in the product. The line is gold ink; the seal is the
 * brand's vermilion, reserved for this stamp (brand/README.md). It presses in once, after the score.
 */
export function PraiseLine({ earned, text }: PraiseLineProps) {
  const copy = useCopy()
  const reduce = useReduceMotion()
  if (!earned) {
    return null
  }
  return (
    <div role="note" aria-label={copy.praise.label} className="flex items-center gap-4">
      <m.span
        initial={reduce ? false : { scale: 1.35, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring.ui, delay: 0.15 }}
        className="inline-grid shrink-0 -rotate-6 place-items-center rounded-[5px] border-2 border-stamp px-2 py-1 font-display text-callout leading-none text-stamp-ink"
      >
        {copy.praise.stamp}
      </m.span>
      <p className="font-display text-title-3 text-praise-ink">{text}</p>
    </div>
  )
}
