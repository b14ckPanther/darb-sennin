import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../lib/cx'

interface Option<T extends string> {
  value: T
  label: ReactNode
  /** Accessible name when the label is not plain text. */
  name?: string
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
  className?: string
  /** Stretch options to fill the row (phone pane switchers). */
  stretch?: boolean
}

/**
 * iOS-style segmented control. A radio group: one tab stop, arrow keys move and select
 * (WAI-ARIA radio group pattern), so it never traps or multiplies Tab presses.
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  stretch = false,
}: SegmentedProps<T>) {
  const group = useRef<HTMLDivElement>(null)
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const at = options.findIndex((o) => o.value === value)
    const next = options[(at + step + options.length) % options.length]
    if (!next) return
    onChange(next.value)
    const buttons = group.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
    buttons?.[options.indexOf(next)]?.focus()
  }
  return (
    <div
      ref={group}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cx(
        'inline-flex rounded-control bg-surface-sunk p-0.5',
        stretch && 'flex w-full',
        className,
      )}
    >
      {options.map((option) => {
        const checked = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.name}
            tabIndex={checked ? 0 : -1}
            onClick={() => {
              onChange(option.value)
            }}
            className={cx(
              'min-h-9 rounded-[8px] px-3 text-footnote font-medium whitespace-nowrap transition-colors duration-(--duration-micro) pointer-coarse:min-h-touch',
              stretch && 'flex-1',
              checked ? 'bg-surface text-ink shadow-raised' : 'text-ink-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
