import { useEffect, useState } from 'react'
import { useCopy } from '../copy/copy'
import { cx } from '../lib/cx'

/** The ensō mark from brand/exports, on its forest tile. */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <img src="/mark-on-forest.svg" width={size} height={size} alt="" className="rounded-[22%]" />
  )
}

export function DemoBanner() {
  const copy = useCopy()
  return (
    <span className="inline-flex items-center rounded-chip border border-line-strong px-2 py-0.5 text-caption font-medium text-ink-muted">
      {copy.demo.banner}
    </span>
  )
}

export function Brand() {
  const copy = useCopy()
  return (
    <a href="?" className="flex min-h-touch items-center gap-2.5 rounded-control no-underline">
      <Mark />
      <span className="font-display text-title-3 text-ink">{copy.brand.name}</span>
    </a>
  )
}

type Theme = 'system' | 'light' | 'dark'
const storageKey = 'sennin.theme'

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(storageKey)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

/** Segmented control for the theme. Stored per viewer; the page renders fine without storage. */
export function ThemeSwitch() {
  const copy = useCopy()
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    try {
      localStorage.setItem(storageKey, theme)
    } catch {
      // Storage can be blocked; the choice still applies for this visit.
    }
  }, [theme])
  const options: Theme[] = ['system', 'light', 'dark']
  return (
    <div
      role="radiogroup"
      aria-label={copy.screens.catalogue.theme}
      className="inline-flex rounded-control bg-surface-sunk p-0.5"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={theme === option}
          onClick={() => {
            setTheme(option)
          }}
          className={cx(
            'min-h-9 rounded-[8px] px-3 text-footnote font-medium transition-colors duration-(--duration-micro)',
            theme === option
              ? 'bg-surface text-ink shadow-raised'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {copy.screens.catalogue[option]}
        </button>
      ))}
    </div>
  )
}
