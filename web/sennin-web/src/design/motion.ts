// Motion tokens (docs/UI_DESIGN.md section 3). Springs, never linear easing.
// CSS durations and easings live in tokens.css; these are the spring settings Motion needs.

export const spring = {
  /** Buttons, rows, chips, toasts. */
  ui: { type: 'spring', stiffness: 420, damping: 38, mass: 1 },
  /** Sheets and anything the finger drags. */
  sheet: { type: 'spring', stiffness: 260, damping: 30, mass: 1 },
} as const

/** Pressed-state scale for buttons and rows. */
export const pressScale = 0.97

/** Seconds, for Motion's non-spring fades. Matches --duration-* in tokens.css. */
export const duration = { micro: 0.12, state: 0.2, layout: 0.32 } as const
