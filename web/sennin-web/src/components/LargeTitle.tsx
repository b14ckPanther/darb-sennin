import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cx } from '../lib/cx'

interface LargeTitleProps {
  title: string
  /** Controls on the trailing edge of the bar, such as a filter button. */
  trailing?: ReactNode
  /** A back button on the leading edge, for pages pushed from another page. */
  leading?: ReactNode
  children?: ReactNode
}

/** iOS-style large title that collapses into a compact bar title once it scrolls away. */
export function LargeTitle({ title, trailing, leading, children }: LargeTitleProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const node = heading.current
    if (!node || typeof IntersectionObserver === 'undefined') {
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) {
          setCollapsed(!entry.isIntersecting)
        }
      },
      // Measured, so the safe-area inset above the bar row is included.
      { rootMargin: `-${String(bar.current?.offsetHeight ?? 0)}px 0px 0px 0px` },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div
        ref={bar}
        data-collapsed={String(collapsed)}
        className={cx(
          'sticky top-0 z-30 pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] transition-[background-color,border-color] duration-(--duration-state)',
          collapsed ? 'material-bar border-b border-line' : 'border-b border-transparent',
        )}
      >
        <div className="flex h-14 items-center justify-between gap-2 px-4">
          {leading}
          <span
            aria-hidden="true"
            className={cx(
              'min-w-0 flex-1 truncate font-sans text-body font-semibold text-ink transition-opacity duration-(--duration-state)',
              collapsed ? 'opacity-100' : 'opacity-0',
            )}
          >
            {title}
          </span>
          <div className="flex items-center gap-1">{trailing}</div>
        </div>
      </div>
      <header className="px-4 pb-2">
        <h1 ref={heading} className="font-display text-large-title tracking-display text-ink">
          {title}
        </h1>
        {children}
      </header>
    </>
  )
}
