import { animate, motion, useMotionValue, useReducedMotion, type PanInfo } from 'motion/react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { fill, useCopy } from '../copy/copy'
import { gesture, spring } from '../design/motion'
import { Icon, type IconName } from './Icon'

export interface RowAction {
  id: string
  label: string
  icon: IconName
  onAction: () => void
}

interface ListRowProps {
  title: string
  subtitle?: string
  trailing?: ReactNode
  actions?: RowAction[]
  onSelect: () => void
}

/** Native-style list row; swipe left for actions, which are also plain buttons for keyboard users. */
export function ListRow({ title, subtitle, trailing, actions = [], onSelect }: ListRowProps) {
  const copy = useCopy()
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const tray = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [trayWidth, setTrayWidth] = useState(0)

  useLayoutEffect(() => {
    setTrayWidth(tray.current?.offsetWidth ?? 0)
  }, [actions.length])

  const settle = (next: boolean) => {
    setOpen(next)
    const width = tray.current?.offsetWidth ?? 0
    const to = next ? -width : 0
    if (reduce) {
      x.set(to)
    } else {
      void animate(x, to, spring.ui)
    }
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const width = tray.current?.offsetWidth ?? 0
    const pastHalf = -info.offset.x > width * gesture.commitFraction
    const flick = info.velocity.x < -gesture.flickVelocity
    settle(pastHalf || flick)
  }

  return (
    <li
      data-open={String(open)}
      className="relative overflow-hidden border-b border-line bg-surface last:border-b-0"
    >
      <motion.div
        style={{ x }}
        drag={actions.length > 0 && !reduce ? 'x' : false}
        dragConstraints={{ left: -trayWidth, right: 0 }}
        dragElastic={0.1}
        onDragEnd={onDragEnd}
        className="relative z-10 bg-surface"
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-(--duration-micro) active:bg-surface-sunk"
        >
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body text-ink">{title}</span>
            {subtitle ? (
              <span className="block truncate text-footnote text-ink-muted">{subtitle}</span>
            ) : null}
          </span>
          {trailing ? <span className="num text-callout text-ink-muted">{trailing}</span> : null}
          <Icon name="chevron-right" size={18} className="text-ink-muted" />
        </button>
      </motion.div>
      {actions.length > 0 ? (
        <div
          ref={tray}
          role="group"
          aria-label={fill(copy.list.actions, { title })}
          onFocus={() => {
            settle(true)
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              settle(false)
            }
          }}
          className="absolute inset-y-0 right-0 z-0 flex"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                action.onAction()
                settle(false)
              }}
              className="flex w-20 flex-col items-center justify-center gap-1 bg-surface-sunk text-caption font-medium text-ink first:border-l first:border-line"
            >
              <Icon name={action.icon} size={20} />
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </li>
  )
}
