import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useCopy } from '../copy/copy'
import { spring } from '../design/motion'
import { Icon } from './Icon'

type Tone = 'info' | 'error'

interface ToastProps {
  message: string
  tone?: Tone
  /** From config/ui/behaviour.json; omit to keep the toast until dismissed. */
  durationMs?: number
  onDismiss: () => void
}

/** The visible card. Announcement comes from the region it is rendered in (ToastRegion). */
export function Toast({ message, tone = 'info', durationMs, onDismiss }: ToastProps) {
  const copy = useCopy()
  const reduce = useReducedMotion()
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (durationMs === undefined || paused) {
      return undefined
    }
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [durationMs, onDismiss, paused])

  const pause = () => {
    setPaused(true)
  }
  const resume = () => {
    setPaused(false)
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.ui}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      className="material-bar pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-panel border border-line py-2 pr-2 pl-4 text-callout text-ink shadow-raised"
    >
      <Icon
        name={tone === 'error' ? 'warning' : 'info'}
        size={18}
        className={tone === 'error' ? 'text-fail-mark' : 'text-ink-muted'}
      />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="grid size-touch place-items-center rounded-control text-ink-muted hover:bg-surface-sunk hover:text-ink"
      >
        <Icon name="fail" size={18} label={copy.toast.dismiss} />
      </button>
    </motion.div>
  )
}

interface ToastRegionProps {
  toast: { message: string; tone?: Tone } | null
  durationMs?: number
  onDismiss: () => void
}

/**
 * Mount once per page. Both live regions exist before any message, so screen readers announce
 * what is rendered into them: polite for info, assertive for errors.
 */
export function ToastRegion({ toast, durationMs, onDismiss }: ToastRegionProps) {
  const copy = useCopy()
  const tone = toast?.tone ?? 'info'
  const card = toast ? (
    <Toast message={toast.message} tone={tone} durationMs={durationMs} onDismiss={onDismiss} />
  ) : null
  return (
    <section
      aria-label={copy.toast.region}
      className="pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex justify-center"
    >
      <div role="status" className="contents">
        {tone === 'info' ? card : null}
      </div>
      <div role="alert" className="contents">
        {tone === 'error' ? card : null}
      </div>
    </section>
  )
}
