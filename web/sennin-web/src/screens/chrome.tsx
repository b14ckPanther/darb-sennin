import { useCopy } from '../copy/copy'
import { Segmented } from '../components/Segmented'
import { Link } from '../lib/Link'
import { updateSettings, useSettings, type Theme } from '../lib/settings'

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
    <Link href="/" className="flex min-h-touch items-center gap-2.5 rounded-control no-underline">
      <Mark />
      <span className="font-display text-title-3 text-ink">{copy.brand.name}</span>
    </Link>
  )
}

/** Theme picker. Stored per viewer; the page renders fine without storage. */
export function ThemeSwitch() {
  const copy = useCopy()
  const { theme } = useSettings()
  return (
    <Segmented<Theme>
      label={copy.screens.catalogue.theme}
      value={theme}
      onChange={(next) => {
        updateSettings({ theme: next })
      }}
      options={(['system', 'light', 'dark'] as const).map((option) => ({
        value: option,
        label: copy.screens.catalogue[option],
      }))}
    />
  )
}
