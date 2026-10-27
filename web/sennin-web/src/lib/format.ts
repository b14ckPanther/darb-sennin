import languageConfig from '@config/ui/languages.json'
import locale from '@config/ui/locale.json'
import type { LanguageId } from '../api/types'

// The user's day is reckoned in their time zone (spec: the day ends at 04:00 Asia/Jerusalem).
const timeZone = locale.timeZone

const dateTime = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone,
})
const dayOnly = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone,
})
const shortDay = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone })
const timeOnly = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone })

/** "Tue 27 Oct, 21:42" */
export function formatWhen(iso: string): string {
  const parts = Object.fromEntries(
    dateTime.formatToParts(new Date(iso)).map((p) => [p.type, p.value]),
  )
  return `${parts.weekday ?? ''} ${parts.day ?? ''} ${parts.month ?? ''}, ${parts.hour ?? ''}:${parts.minute ?? ''}`
}

export const formatDay = (iso: string) => dayOnly.format(new Date(iso))
export const formatShortDay = (iso: string) => shortDay.format(new Date(iso))
export const formatTime = (iso: string) => timeOnly.format(new Date(iso))

/** Calendar key in the user's zone, for grouping history by day. */
export function dayKey(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date(iso))
}

export function formatMs(ms: number | null): string {
  if (ms === null) return ''
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${String(Math.round(ms))} ms`
}

const byId = new Map(languageConfig.languages.map((l) => [l.id as LanguageId, l]))

export const languageName = (id: LanguageId) => byId.get(id)?.label ?? id
export const languageShort = (id: LanguageId) => byId.get(id)?.short ?? id
export const languages = languageConfig.languages.map((l) => l.id as LanguageId)
export const editorMode = (id: LanguageId) => byId.get(id)?.editor ?? 'plain'
