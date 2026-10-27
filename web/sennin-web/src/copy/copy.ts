import boss from '@config/copy/en/boss.json'
import history from '@config/copy/en/history.json'
import library from '@config/copy/en/library.json'
import nav from '@config/copy/en/nav.json'
import profile from '@config/copy/en/profile.json'
import pseudo from '@config/copy/en/pseudo.json'
import ranks from '@config/copy/en/ranks.json'
import settings from '@config/copy/en/settings.json'
import states from '@config/copy/en/states.json'
import ui from '@config/copy/en/ui.json'
import weakness from '@config/copy/en/weakness.json'
import workspace from '@config/copy/en/workspace.json'
import { createContext, useContext } from 'react'

type Strip<T> = Omit<T, '$comment'>

const strip = <T extends { $comment?: string }>(value: T): Strip<T> =>
  Object.fromEntries(Object.entries(value).filter(([key]) => key !== '$comment')) as Strip<T>

/** All interface copy, one file per area under config/copy/en (CLAUDE.md 1.2). */
export const defaultCopy = {
  ...strip(ui),
  nav: strip(nav),
  states: strip(states),
  library: strip(library),
  workspace: strip(workspace),
  weakness: strip(weakness),
  boss: strip(boss),
  history: strip(history),
  ranks: strip(ranks),
  settings: strip(settings),
  profile: strip(profile),
  pseudo: strip(pseudo),
}

export type Copy = typeof defaultCopy

export const CopyContext = createContext<Copy>(defaultCopy)

/** Interface copy from config/copy; components never hold their own strings. */
export function useCopy(): Copy {
  return useContext(CopyContext)
}

/** Fills {name} placeholders. Unknown names stay visible so a missing value is obvious. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  )
}
