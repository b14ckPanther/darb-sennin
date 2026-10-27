import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type PanInfo,
} from 'motion/react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { useCopy } from '../copy/copy'
import { gesture, spring } from '../design/motion'
import { Icon } from './Icon'

interface SheetProps {
  open: boolean
  title: string
  /** Heights as fractions of the viewport, smallest first (peek, half, full). */
  detents: number[]
  initialDetent?: number
  onClose: () => void
  children: ReactNode
}

const focusable =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Bottom sheet with detents, drag to resize or dismiss, focus kept inside while open. */
export function Sheet({ open, title, detents, initialDetent, onClose, children }: SheetProps) {
  const copy = useCopy()
  const reduce = useReducedMotion()
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const lastDetent = detents.length - 1
  const startDetent = initialDetent ?? Math.min(1, lastDetent)
  const [detent, setDetent] = useState(startDetent)
  const [wasOpen, setWasOpen] = useState(open)
  const controls = useDragControls()
  const close = useRef<HTMLButtonElement>(null)
  const height = detents[detent] ?? detents[lastDetent] ?? 1

  // Every opening starts at the initial detent.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setDetent(startDetent)
    }
  }

  useEffect(() => {
    if (!open) {
      return undefined
    }
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    close.current?.focus()
    // The page behind a modal sheet does not scroll.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open])

  const startDrag = (event: PointerEvent) => {
    controls.start(event)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab' || !panel.current) {
      return
    }
    const items = [...panel.current.querySelectorAll<HTMLElement>(focusable)]
    const first = items[0]
    const last = items[items.length - 1]
    if (!first || !last) {
      return
    }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const travel = window.innerHeight * height
    const down =
      info.offset.y > travel * gesture.commitFraction || info.velocity.y > gesture.flickVelocity
    const up =
      info.offset.y < -travel * gesture.commitFraction || info.velocity.y < -gesture.flickVelocity
    if (down) {
      if (detent === 0) {
        onClose()
      } else {
        setDetent(detent - 1)
      }
    } else if (up && detent < lastDetent) {
      setDetent(detent + 1)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40" onKeyDown={onKeyDown}>
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/30"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-detent={detent}
            // Drag starts only from the handle and header, so content scrolls and selects normally.
            drag="y"
            dragListener={false}
            dragControls={controls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={reduce ? 0 : 0.6}
            onDragEnd={onDragEnd}
            initial={reduce ? false : { y: '100%' }}
            animate={{ y: 0, height: `${String(height * 100)}dvh` }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={reduce ? { duration: 0 } : spring.sheet}
            style={{ touchAction: 'auto', userSelect: 'auto' }}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-w-2xl flex-col rounded-t-panel border border-b-0 border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-sheet"
          >
            <button
              type="button"
              aria-label={copy.sheet.handle}
              onClick={() => {
                setDetent(detent >= lastDetent ? 0 : detent + 1)
              }}
              onPointerDown={startDrag}
              className="mx-auto grid min-h-touch w-24 shrink-0 cursor-grab touch-none place-items-center rounded-chip"
            >
              <span className="h-1 w-9 rounded-full bg-line-strong" />
            </button>
            <header
              onPointerDown={startDrag}
              className="flex touch-none items-center justify-between gap-4 px-5 pb-2"
            >
              <h2 id={titleId} className="font-display text-title-3 text-ink">
                {title}
              </h2>
              <button
                ref={close}
                type="button"
                onClick={onClose}
                className="grid size-touch place-items-center rounded-control text-ink-muted hover:bg-surface-sunk hover:text-ink"
              >
                <Icon name="fail" size={22} label={copy.sheet.close} />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
