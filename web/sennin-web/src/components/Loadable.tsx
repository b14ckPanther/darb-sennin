import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { fill, useCopy } from '../copy/copy'
import { cx } from '../lib/cx'
import { Button } from './Button'
import { EmptyState } from './EmptyState'

/** Placeholder bars in the shape of what is coming, with words: never a bare spinner (2.11). */
export function Skeleton({
  what,
  rows = 6,
  shape = 'rows',
}: {
  what: string
  rows?: number
  shape?: 'rows' | 'sheet' | 'split'
}) {
  const copy = useCopy()
  const bar = 'rounded-[4px] bg-surface-sunk motion-safe:animate-pulse'
  return (
    <div role="status" className="px-4 py-6 md:px-0">
      <p className="mb-4 text-footnote text-ink-muted">{fill(copy.states.loading, { what })}</p>
      <div aria-hidden="true" className={cx(shape === 'split' && 'grid gap-6 lg:grid-cols-2')}>
        {shape !== 'rows' ? <div className={cx(bar, 'mb-5 h-9 w-2/3')} /> : null}
        <div className="divide-y divide-line">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex items-center gap-3 py-3.5">
              <div
                className={cx(bar, 'h-4')}
                style={{ width: `${String(40 + ((i * 23) % 45))}%` }}
              />
              <div className={cx(bar, 'ml-auto h-4 w-12')} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  const copy = useCopy().states.offline
  return (
    <div className="px-4 md:px-0">
      <EmptyState
        icon="offline"
        title={copy.title}
        action={
          <Button variant="secondary" icon="retry" onClick={onRetry}>
            {copy.retry}
          </Button>
        }
      >
        {copy.body}
      </EmptyState>
    </div>
  )
}

/** Renders a query: skeleton while loading, a plain error with retry, then the content. */
export function Loadable<T>({
  query,
  what,
  shape,
  rows,
  children,
}: {
  query: UseQueryResult<T>
  what: string
  shape?: 'rows' | 'sheet' | 'split'
  rows?: number
  children: (data: T) => ReactNode
}) {
  if (query.isError) {
    return (
      <LoadError
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  }
  if (query.data === undefined) {
    return <Skeleton what={what} shape={shape} rows={rows} />
  }
  return <>{children(query.data)}</>
}
