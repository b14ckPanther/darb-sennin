import { useSyncExternalStore } from 'react'

/** A small history router: the prototype has a dozen routes and no data loaders. */
export interface Location {
  path: string
  search: string
}

const listeners = new Set<() => void>()
let snapshot: Location | null = null

function read(): Location {
  const next = { path: window.location.pathname, search: window.location.search }
  if (snapshot?.path !== next.path || snapshot.search !== next.search) {
    snapshot = next
  }
  return snapshot
}

function subscribe(notify: () => void) {
  listeners.add(notify)
  window.addEventListener('popstate', notify)
  return () => {
    listeners.delete(notify)
    window.removeEventListener('popstate', notify)
  }
}

export function navigate(to: string, options: { replace?: boolean } = {}) {
  if (options.replace) {
    window.history.replaceState(null, '', to)
  } else {
    window.history.pushState(null, '', to)
    window.scrollTo({ top: 0 })
  }
  listeners.forEach((notify) => {
    notify()
  })
}

export function useLocation(): Location {
  return useSyncExternalStore(subscribe, read, read)
}

export function useSearchParam(name: string): string | null {
  return new URLSearchParams(useLocation().search).get(name)
}

/** `/problems/:id` against a path; null when it does not match. Trailing slashes are ignored. */
export function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const split = (value: string) => value.split('/').filter(Boolean)
  const want = split(pattern)
  const have = split(path)
  if (want.length !== have.length) {
    return null
  }
  const params: Record<string, string> = {}
  for (const [i, part] of want.entries()) {
    const actual = have[i] ?? ''
    if (part.startsWith(':')) {
      params[part.slice(1)] = decodeURIComponent(actual)
    } else if (part !== actual) {
      return null
    }
  }
  return params
}
