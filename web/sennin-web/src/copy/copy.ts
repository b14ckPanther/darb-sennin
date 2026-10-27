import ui from '@config/copy/en/ui.json'
import { createContext, useContext } from 'react'

export type Copy = Omit<typeof ui, '$comment'>

export const defaultCopy: Copy = ui

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
