import { useId, type ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon: IconName
  title: string
  action?: ReactNode
  children?: ReactNode
}

/** An empty place is an invitation: say what goes here and offer the next step. */
export function EmptyState({ icon, title, action, children }: EmptyStateProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="flex max-w-md flex-col items-start gap-3 py-8">
      <Icon name={icon} size={28} className="text-ink-muted" />
      <h3 id={titleId} className="font-display text-title-3 text-ink">
        {title}
      </h3>
      {children ? <p className="text-callout text-ink-muted">{children}</p> : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </section>
  )
}
