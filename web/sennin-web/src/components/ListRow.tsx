import { animate, motion, useMotionValue, type PanInfo } from 'motion/react'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { fill, useCopy } from '../copy/copy'
import { gesture, pressScale, spring } from '../design/motion'
import { Icon, type IconName } from './Icon'
import { useReduceMotion } from '../lib/motion'

export interface RowAction {
  id: string
  label: string
  icon: IconName
  onAction: () => void
}

interface ListRowProps {
  /** A status mark before the title. */
  leading?: ReactNode
  title: string
  subtitle?: ReactNode
  trailing?: ReactNode
  actions?: RowAction[]
  onSelect: () => void
}

/** Native-style list row; swipe left for actions, which are also plain buttons for keyboard users. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  actions = [],
  onSelect,
}: ListRowProps) {
  const copy = useCopy()
  const reduce = useReduceMotion()
  const x = useMotionValue(0)
  const tray = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [trayWidth, setTrayWidth] = useState(0)
  // Refs, not state: they are read inside the same pointer sequence that changes them.
  const openRef = useRef(false)
  const openAtPress = useRef(false)
  const dragged = useRef(false)

  useLayoutEffect(() => {
    setTrayWidth(tray.current?.offsetWidth ?? 0)
  }, [actions.length])

  const settle = (next: boolean) => {
    openRef.current = next
    setOpen(next)
    const width = tray.current?.offsetWidth ?? 0
    const to = next ? -width : 0
    if (reduce) {
      x.set(to)
    } else {
      void animate(x, to, spring.ui)
    }
  }

  // Decide from where the row ended up, so a small drag back from open keeps it open.
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const width = tray.current?.offsetWidth ?? 0
    const pastHalf = -x.get() > width * gesture.commitFraction
    if (info.velocity.x < -gesture.flickVelocity) {
      settle(true)
    } else if (info.velocity.x > gesture.flickVelocity) {
      settle(false)
    } else {
      settle(pastHalf)
    }
  }

  // A tap on an open row closes it (as native lists do); a drag never counts as a tap.
  const onRowClick = () => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    if (openAtPress.current) {
      settle(false)
      return
    }
    onSelect()
  }

  return (
    <li
      data-open={String(open)}
      className="relative overflow-hidden border-b border-line bg-surface last:border-b-0"
    >
      <motion.div
        style={{ x }}
        // Reduced motion removes the spring, not the gesture: settle() jumps straight to the end.
        drag={actions.length > 0 ? 'x' : false}
        dragConstraints={{ left: -trayWidth, right: 0 }}
        dragElastic={reduce ? 0 : 0.1}
        dragMomentum={!reduce}
        onDragStart={() => {
          dragged.current = true
        }}
        onDragEnd={onDragEnd}
        onPointerDownCapture={() => {
          dragged.current = false
          openAtPress.current = openRef.current
        }}
        className="relative z-10 bg-surface"
      >
        <motion.button
          type="button"
          onClick={onRowClick}
          whileTap={reduce ? undefined : { scale: pressScale }}
          transition={spring.ui}
          className="flex min-h-touch w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-(--duration-micro) active:bg-surface-sunk"
        >
          {leading ? <span className="shrink-0">{leading}</span> : null}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-body text-ink">{title}</span>
            {subtitle ? (
              <span className="line-clamp-2 block text-footnote text-ink-muted">{subtitle}</span>
            ) : null}
          </span>
          {trailing ? <span className="num text-callout text-ink-muted">{trailing}</span> : null}
          <Icon name="chevron-right" size={18} className="text-ink-muted" />
        </motion.button>
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
