import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio, parseThemes } from './contrast'

// The design contract: every pair the UI actually draws, with the WCAG 2.2 AA minimum it must meet.
// 4.5 = body text, 3 = large text, UI components and chart marks (docs/UI_DESIGN.md section 6).
const text = 4.5
const ui = 3

const pairs: [fg: string, bg: string, min: number][] = [
  ['ink', 'canvas', text],
  ['ink', 'surface', text],
  ['ink', 'surface-sunk', text],
  ['ink-muted', 'canvas', text],
  ['ink-muted', 'surface', text],
  ['ink-muted', 'surface-sunk', text],
  ['primary-ink', 'primary', text],
  ['pass-ink', 'surface', text],
  ['pass-ink', 'surface-sunk', text],
  ['fail-ink', 'surface', text],
  ['fail-ink', 'surface-sunk', text],
  ['limit-ink', 'surface', text],
  ['limit-ink', 'surface-sunk', text],
  ['praise-ink', 'surface', text],
  ['praise-ink', 'canvas', text],
  ['pass-mark', 'surface', ui],
  ['fail-mark', 'surface', ui],
  ['limit-mark', 'surface', ui],
  ['pending-mark', 'surface', ui],
  ['stamp', 'surface', ui],
  ['focus', 'canvas', ui],
  ['focus', 'surface', ui],
  ['line-strong', 'surface', ui],
  ['line-strong', 'canvas', ui],
  ['ink', 'bar', text],
  ['ink-muted', 'bar', text],
  ['tab-active', 'bar', ui],
  ['plot-measured', 'surface', ui],
  ['plot-target', 'surface', ui],
  ['fail-ink', 'fail-wash', text],
  ['ink', 'fail-wash', text],
  ['ink', 'highlight', text],
  ['ink-muted', 'highlight', text],
  ['line-strong', 'surface-sunk', ui],
]

const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8')
const themes = parseThemes(css)

describe('colour tokens', () => {
  it('defines a light and a dark theme', () => {
    expect(Object.keys(themes.light).length).toBeGreaterThan(0)
    expect(Object.keys(themes.dark).length).toBeGreaterThan(0)
  })

  it('keeps the system-dark block identical to the explicit dark block', () => {
    expect(themes.darkBySystem).toEqual(themes.dark)
  })

  it('defines every colour in both themes', () => {
    expect(Object.keys(themes.dark).sort()).toEqual(Object.keys(themes.light).sort())
  })

  for (const theme of ['light', 'dark'] as const) {
    describe(theme, () => {
      it.each(pairs)('%s on %s meets %d:1', (fg, bg, min) => {
        const colours = themes[theme]
        const a = colours[fg]
        const b = colours[bg]
        expect(a, `--${fg} missing`).toBeDefined()
        expect(b, `--${bg} missing`).toBeDefined()
        expect(contrastRatio(a ?? '', b ?? '')).toBeGreaterThanOrEqual(min)
      })
    })
  }

  it('computes the WCAG ratio for known values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
  })
})
