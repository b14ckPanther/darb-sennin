import { useCopy } from '../copy/copy'
import { cx } from '../lib/cx'

const inRange = (n: number, r: [number, number] | null) => r !== null && n >= r[0] && n <= r[1]

interface CodePanelProps {
  code: string
  /** Lines tied to the first failure: the bracket in the margin. */
  bracket: [number, number] | null
  /** Lines lit by a hovered or jumped-to evidence chip. */
  lit: [number, number] | null
  /** Lines lit by the pseudo code mapping. */
  mapped?: number | null
  label?: string
  idPrefix?: string
  onHoverLine?: (line: number | null) => void
}

/** Read-only code with line ids that evidence chips point at (`code-line-12`). */
export function CodePanel({
  code,
  bracket,
  lit,
  mapped = null,
  label,
  idPrefix = 'code-line',
  onHoverLine,
}: CodePanelProps) {
  const copy = useCopy().screens.verdict
  const lines = code.split('\n')
  return (
    <pre
      tabIndex={0}
      aria-label={label ?? copy.code}
      className="overflow-x-auto py-3 text-footnote leading-6"
      onMouseLeave={() => onHoverLine?.(null)}
    >
      {lines.map((line, i) => {
        const n = i + 1
        return (
          <span
            key={n}
            id={`${idPrefix}-${String(n)}`}
            tabIndex={-1}
            onMouseEnter={() => onHoverLine?.(n)}
            className={cx(
              'relative grid scroll-mt-28 grid-cols-[2.5rem_1fr] pr-4 outline-none transition-colors duration-(--duration-state)',
              (inRange(n, lit) || mapped === n) && 'bg-highlight',
            )}
          >
            <span
              aria-hidden="true"
              className={cx(
                'num pr-3 text-right text-ink-muted select-none',
                inRange(n, bracket) && 'text-fail-ink',
              )}
            >
              {n}
            </span>
            {inRange(n, bracket) ? (
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-fail-mark" />
            ) : null}
            <code className="whitespace-pre text-ink">{line || ' '}</code>
          </span>
        )
      })}
    </pre>
  )
}
