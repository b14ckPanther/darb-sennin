import { m } from 'motion/react'
import { spring } from '../design/motion'
import { cx } from '../lib/cx'
import { useReduceMotion } from '../lib/motion'

interface BossHpProps {
  total: number
  /** Segments already knocked out. Raising it while mounted makes the new ones fall. */
  fallen: number
  label: string
  size?: 'compact' | 'large'
}

/**
 * The boss's health, one segment per hidden case (UI_DESIGN.md 2.7). A passed case knocks its
 * segment out: it drops and fades, leaving a dashed socket. No glow, no particles. Under reduced
 * motion the segment simply empties.
 */
export function BossHp({ total, fallen, label, size = 'compact' }: BossHpProps) {
  const reduce = useReduceMotion()
  const large = size === 'large'
  return (
    <div
      role="img"
      aria-label={label}
      className={cx('grid', large ? 'gap-1 md:gap-1.5' : 'gap-[3px]')}
      style={{ gridTemplateColumns: `repeat(${String(total)}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: total }, (_, i) => {
        const down = i < fallen
        return (
          <span
            key={i}
            data-fallen={String(down)}
            className={cx(
              'relative rounded-[2px] border border-dashed border-line-strong',
              large ? 'h-7 md:h-10' : 'h-3',
            )}
          >
            <m.span
              aria-hidden="true"
              className="absolute -inset-px rounded-[2px] bg-ink"
              initial={false}
              animate={
                down
                  ? { opacity: 0, y: large ? 22 : 8, rotate: i % 2 ? 7 : -7 }
                  : { opacity: 1, y: 0, rotate: 0 }
              }
              transition={
                reduce ? { duration: 0 } : { ...spring.sheet, opacity: { duration: 0.32 } }
              }
            />
          </span>
        )
      })}
    </div>
  )
}
