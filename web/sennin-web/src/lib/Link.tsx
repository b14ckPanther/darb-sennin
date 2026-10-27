import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react'
import { navigate, useLocation } from './router'

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  children: ReactNode
  /** Treat any path under href as current, for section links like Library. */
  section?: boolean
  /** Overrides the path match, for links whose section spans other paths. */
  current?: boolean
}

export function Link({
  href,
  children,
  section = false,
  current: forced,
  onClick,
  ...rest
}: LinkProps) {
  const { path } = useLocation()
  const base = href.split('?')[0] ?? href
  const current =
    (forced ?? path === base) || (section && base !== '/' && path.startsWith(`${base}/`))
  const handle = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    navigate(href)
  }
  return (
    <a href={href} aria-current={current ? 'page' : undefined} onClick={handle} {...rest}>
      {children}
    </a>
  )
}
