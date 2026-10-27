import { forwardRef, lazy, Suspense } from 'react'
import type { CodeEditorHandle, CodeEditorProps } from './types'

const CodeEditor = lazy(() => import('./CodeEditor').then((m) => ({ default: m.CodeEditor })))

/**
 * The code shows as plain, styled text the moment the page paints; CodeMirror takes over when its
 * chunk arrives. Same font, size and line numbers, so the swap does not move anything.
 */
function CodeFallback({
  value,
  fontSize,
  label,
}: Pick<CodeEditorProps, 'value' | 'fontSize' | 'label'>) {
  const lines = value.split('\n')
  return (
    <div
      className="flex h-full overflow-hidden bg-surface py-3 font-mono text-ink"
      style={{ fontSize: `${String(fontSize)}px`, lineHeight: 1.6 }}
    >
      <div
        aria-hidden="true"
        className="num w-9 shrink-0 pr-2 text-right text-ink-muted select-none"
      >
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre aria-label={label} className="m-0 min-w-0 flex-1 pl-1 font-mono whitespace-pre-wrap">
        {value}
      </pre>
    </div>
  )
}

export const LazyCodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function LazyCodeEditor(props, ref) {
    return (
      <Suspense
        fallback={
          <CodeFallback value={props.value} fontSize={props.fontSize} label={props.label} />
        }
      >
        <CodeEditor ref={ref} {...props} />
      </Suspense>
    )
  },
)
