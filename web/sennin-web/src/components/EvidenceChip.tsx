import { fill, useCopy } from '../copy/copy'
import { Icon, type IconName } from './Icon'

export type EvidenceKind = 'case' | 'lines' | 'probe'

const kindIcon: Record<EvidenceKind, IconName> = {
  case: 'statement',
  lines: 'code',
  probe: 'plot',
}

interface EvidenceChipProps {
  kind: EvidenceKind
  label: string
  /** Element id of the evidence this chip points at. */
  target: string
  onJump?: (target: string) => void
  onHighlight?: (target: string | null) => void
}

/** A citation. Every finding and grade claim links its evidence through one of these. */
export function EvidenceChip({ kind, label, target, onJump, onHighlight }: EvidenceChipProps) {
  const copy = useCopy()
  return (
    <button
      type="button"
      aria-label={fill(copy.evidence.jump, { label })}
      aria-controls={target}
      onClick={() => onJump?.(target)}
      onFocus={() => onHighlight?.(target)}
      onBlur={() => onHighlight?.(null)}
      onMouseEnter={() => onHighlight?.(target)}
      onMouseLeave={() => onHighlight?.(null)}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-chip border border-line bg-surface-sunk px-2 font-mono text-footnote text-ink transition-colors duration-(--duration-micro) hover:border-line-strong hover:bg-highlight pointer-coarse:min-h-touch"
    >
      <Icon name={kindIcon[kind]} size={14} className="text-ink-muted" />
      {label}
    </button>
  )
}
