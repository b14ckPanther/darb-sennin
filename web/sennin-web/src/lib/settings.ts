import behaviour from '@config/ui/behaviour.json'
import { useSyncExternalStore } from 'react'
import type { DemoState } from '../api/mock'

export type Theme = 'system' | 'light' | 'dark'
export type MotionPref = 'system' | 'reduce' | 'allow'

export interface Settings {
  theme: Theme
  editorFontSize: number
  keymap: 'default' | 'vim'
  sound: boolean
  motion: MotionPref
  demo: DemoState
}

const key = 'sennin.settings'
// The theme keeps its own key: index.html reads it before first paint.
const themeKey = 'sennin.theme'

const defaults: Settings = {
  theme: 'system',
  editorFontSize: behaviour.editor.defaultFontSize,
  keymap: 'default',
  sound: false,
  motion: 'system',
  demo: { judgePaused: false, reviewerDown: false, newAccount: false, offline: false },
}

let current: Settings | null = null
const listeners = new Set<() => void>()

/** Per-viewer preferences. Storage can be blocked; the page then runs on defaults. */
export function readSettings(fresh: boolean): Settings {
  if (fresh) {
    return structuredClone(defaults)
  }
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}') as Partial<Settings>
    const theme = localStorage.getItem(themeKey)
    return {
      ...structuredClone(defaults),
      ...stored,
      demo: { ...defaults.demo, ...stored.demo },
      theme: theme === 'light' || theme === 'dark' ? theme : 'system',
    }
  } catch {
    return structuredClone(defaults)
  }
}

function get(): Settings {
  current ??= readSettings(false)
  return current
}

/** Current settings outside React, for the mock API's demo switches. */
export const currentSettings = get

export function updateSettings(patch: Partial<Settings>) {
  current = { ...get(), ...patch }
  try {
    const { theme, ...rest } = current
    localStorage.setItem(key, JSON.stringify(rest))
    localStorage.setItem(themeKey, theme)
  } catch {
    // Blocked storage: the change still applies for this visit.
  }
  applyDocument(current)
  listeners.forEach((notify) => {
    notify()
  })
}

/** Mirrors theme and motion onto <html> so CSS and the pre-paint script agree. */
export function applyDocument(s: Settings = get()) {
  const root = document.documentElement
  if (s.theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', s.theme)
  }
  if (s.motion === 'system') {
    root.removeAttribute('data-motion')
  } else {
    root.setAttribute('data-motion', s.motion)
  }
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (notify) => {
      listeners.add(notify)
      return () => {
        listeners.delete(notify)
      }
    },
    get,
    get,
  )
}

export const editorFontSizes: readonly number[] = behaviour.editor.fontSizes
