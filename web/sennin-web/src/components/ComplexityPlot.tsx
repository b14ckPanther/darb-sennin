import { useId } from 'react'
import { fill, useCopy } from '../copy/copy'

export interface ProbePoint {
  n: number
  /** CPU time in milliseconds, from cgroup stats. */
  ms: number
}

type Props =
  | {
      points: ProbePoint[]
      fit: { exponent: number; r2: number }
      target: { label: string; exponent: number }
      skipped?: undefined
    }
  | { skipped: string; points?: undefined; fit?: undefined; target?: undefined }

// Drawing geometry in SVG user units; the SVG scales to its container.
const box = { width: 360, height: 200, left: 44, right: 72, top: 12, bottom: 32 }

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toPrecision(2)} s` : `${ms.toPrecision(2)} ms`
}

function Power({ value }: { value: number }) {
  return (
    <>
      10
      <tspan dy="-0.5em" fontSize="0.75em">
        {value}
      </tspan>
    </>
  )
}

/** Log-log plate: measured points, fitted line and target line (docs/UI_DESIGN.md section 1.4). */
export function ComplexityPlot(props: Props) {
  const copy = useCopy()
  const captionId = useId()

  if (props.skipped !== undefined) {
    return (
      <figure
        aria-labelledby={captionId}
        className="rounded-control border border-dashed border-line-strong p-4"
      >
        <figcaption id={captionId} className="text-callout text-ink">
          <span className="block font-medium">{copy.plot.skipped}</span>
          <span className="text-ink-muted">{props.skipped}</span>
        </figcaption>
      </figure>
    )
  }

  const { points, fit, target } = props
  const lx = points.map((p) => Math.log10(p.n))
  const ly = points.map((p) => Math.log10(p.ms))
  const x0 = Math.floor(Math.min(...lx))
  const x1 = Math.ceil(Math.max(...lx))
  const y0 = Math.floor(Math.min(...ly))
  const y1 = Math.ceil(Math.max(...ly))
  const plotW = box.width - box.left - box.right
  const plotH = box.height - box.top - box.bottom
  const sx = (v: number) => box.left + ((v - x0) / (x1 - x0 || 1)) * plotW
  const sy = (v: number) => box.top + plotH - ((v - y0) / (y1 - y0 || 1)) * plotH

  // Fitted line: least-squares intercept for the reported slope. Target: same anchor, target slope.
  const intercept = ly.reduce((sum, y, i) => sum + y - fit.exponent * (lx[i] ?? 0), 0) / ly.length
  const firstX = lx[0] ?? x0
  const firstY = ly[0] ?? y0
  const lineEnd = (slope: number, b: number) => {
    const yAtEnd = slope * x1 + b
    // Clip at the top of the plot so a steep line stays inside the frame.
    const xAtTop = yAtEnd > y1 ? (y1 - b) / slope : x1
    return { x: xAtTop, y: Math.min(yAtEnd, y1) }
  }
  const fitEnd = lineEnd(fit.exponent, intercept)
  const targetB = firstY - target.exponent * firstX
  const targetEnd = lineEnd(target.exponent, targetB)

  const summary = fill(copy.plot.summary, {
    exponent: fit.exponent.toFixed(2),
    r2: fit.r2.toFixed(2),
    target: target.label,
  })
  const xTicks = Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i)
  const yTicks = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i)

  return (
    <figure aria-labelledby={captionId} className="m-0">
      <svg
        viewBox={`0 0 ${String(box.width)} ${String(box.height)}`}
        className="h-auto w-full overflow-visible"
        aria-hidden="true"
      >
        {yTicks.map((t) => (
          <g key={`y${String(t)}`}>
            <line
              x1={box.left}
              x2={box.width - box.right}
              y1={sy(t)}
              y2={sy(t)}
              className="stroke-line"
              strokeWidth={1}
            />
            <text
              x={box.left - 8}
              y={sy(t)}
              dy="0.32em"
              textAnchor="end"
              className="num fill-ink-muted text-[10px]"
            >
              {formatMs(10 ** t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text
            key={`x${String(t)}`}
            x={sx(t)}
            y={box.height - 10}
            textAnchor="middle"
            className="num fill-ink-muted text-[10px]"
          >
            <Power value={t} />
          </text>
        ))}
        <line
          x1={sx(firstX)}
          y1={sy(firstY)}
          x2={sx(targetEnd.x)}
          y2={sy(targetEnd.y)}
          className="stroke-plot-target"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
        <text
          x={sx(targetEnd.x) + 6}
          y={sy(targetEnd.y)}
          dy="0.32em"
          className="fill-ink-muted text-[11px]"
        >
          {copy.plot.target}
        </text>
        <line
          x1={sx(x0)}
          y1={sy(fit.exponent * x0 + intercept)}
          x2={sx(fitEnd.x)}
          y2={sy(fitEnd.y)}
          className="stroke-plot-measured"
          strokeWidth={1.5}
        />
        <text x={sx(fitEnd.x) + 6} y={sy(fitEnd.y)} dy="0.32em" className="fill-ink text-[11px]">
          {copy.plot.measured}
        </text>
        {points.map((p, i) => (
          <circle
            key={p.n}
            data-point
            cx={sx(lx[i] ?? 0)}
            cy={sy(ly[i] ?? 0)}
            r={3.5}
            className="fill-plot-measured stroke-surface"
            strokeWidth={2}
          >
            <title>{`n = ${p.n.toLocaleString('en')}: ${formatMs(p.ms)}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption id={captionId} className="mt-2 text-footnote text-ink-muted">
        {summary}
      </figcaption>
      <table className="sr-only">
        <caption>{copy.plot.pointsCaption}</caption>
        <thead>
          <tr>
            <th scope="col">{copy.plot.axisX}</th>
            <th scope="col">{copy.plot.axisY}</th>
          </tr>
        </thead>
        <tbody>
          {points.map((p) => (
            <tr key={p.n}>
              <td>{p.n.toLocaleString('en')}</td>
              <td>{formatMs(p.ms)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
