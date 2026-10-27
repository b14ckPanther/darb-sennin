import { cx } from '../lib/cx'

/** Three-step difficulty mark (UI_DESIGN.md 2.2): rising bars, filled up to the level. */
export function Difficulty({ level, max, label }: { level: number; max: number; label: string }) {
  return (
    <span role="img" aria-label={label} className="inline-flex items-end gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((step) => (
        <span
          key={step}
          className={cx('w-1 rounded-[1px]', step <= level ? 'bg-ink-muted' : 'bg-line-strong/40')}
          style={{ height: `${String(4 + step * 3)}px` }}
        />
      ))}
    </span>
  )
}
