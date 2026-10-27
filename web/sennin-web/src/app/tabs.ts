export type TabId = 'today' | 'library' | 'boss' | 'profile'

export const tabHome: Record<TabId, string> = {
  today: '/',
  library: '/library',
  boss: '/boss',
  profile: '/profile',
}

/** Which phone tab a path belongs to. Profile holds weakness, history, ranks and settings. */
export function tabFor(path: string): TabId {
  if (path.startsWith('/library') || path.startsWith('/problems')) return 'library'
  if (path.startsWith('/boss')) return 'boss'
  if (path === '/' || path === '') return 'today'
  return 'profile'
}
