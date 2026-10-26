// WCAG 2.2 relative luminance and contrast ratio, plus a small reader for tokens.css.
// Used by the token contrast test; kept free of DOM APIs so it runs anywhere.

export type Palette = Record<string, string>

export interface Themes {
  light: Palette
  dark: Palette
  darkBySystem: Palette
}

function channel(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match?.[1]) {
    throw new Error(`Expected a #rrggbb colour, got "${hex}"`)
  }
  const n = Number.parseInt(match[1], 16)
  const r = channel((n >> 16) & 0xff)
  const g = channel((n >> 8) & 0xff)
  const b = channel(n & 0xff)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

// Reads `--color-<name>: #hex` declarations from one block whose selector is `selector`.
function readBlock(css: string, selector: string): Palette {
  const start = css.indexOf(selector)
  if (start < 0) {
    return {}
  }
  const open = css.indexOf('{', start)
  const close = css.indexOf('}', open)
  const body = css.slice(open + 1, close)
  const palette: Palette = {}
  for (const m of body.matchAll(/--color-([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    if (m[1] && m[2]) {
      palette[m[1]] = m[2]
    }
  }
  return palette
}

export function parseThemes(css: string): Themes {
  return {
    light: readBlock(css, '/* theme:light */'),
    dark: readBlock(css, '/* theme:dark */'),
    darkBySystem: readBlock(css, '/* theme:dark-system */'),
  }
}
