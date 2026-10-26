import { motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { useCopy } from '../copy/copy'
import { spring } from '../design/motion'
import { Icon } from './Icon'

interface ToastProps {
  message: string
  tone?: 'info' | 'error'
  /** From config (limits or copy timing); omit to keep the toast until dismissed. */
  durationMs?: number
  onDismiss: () => void
}

export function Toast({ message, tone = 'info', durationMs, onDismiss }: ToastProps) {
  const copy = useCopy()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (durationMs === undefined) {
      return undefined
    }
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => {
      window.clearTimeout(timer)
    }
  }, [durationMs, onDismiss])

  return (
    <motion.div
      role={tone === 'error' ? 'alert' : 'status'}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.ui}
      className="material-bar flex w-full max-w-sm items-center gap-3 rounded-panel border border-line py-2 pr-2 pl-4 text-callout text-ink shadow-raised"
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
