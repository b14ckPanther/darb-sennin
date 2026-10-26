// The ensō, shared by the 3D scene (browser) and the flat SVG marks (Node), so both draw the same stroke.
// Units: the circle has radius `radius` around (0, 0), y up.

/** Centre of the stroke at t in [0, 1]. */
export function ensoPoint(e, t) {
  const a = e.start + e.sweep * t
  const r = e.radius + Math.sin(a * 3 + 1) * e.wobble + t * e.grow
  return [Math.cos(a) * r, Math.sin(a) * r]
}

/** Half-width of the brush at t: lands fast, then thins to a dry tail. */
export function ensoWidth(e, t) {
  return e.width * Math.pow(Math.sin((Math.min(1, t * e.attack) * Math.PI) / 2), 0.6) * (1 - t * e.tail)
}

/** The stroke's outline as one closed polygon: the outer edge forward, the inner edge back. */
export function ensoOutline(e, steps = 240) {
  const outer = [], inner = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const [x, y] = ensoPoint(e, t)
    const [x2, y2] = ensoPoint(e, Math.min(1, t + 1e-3))
    const [x0, y0] = ensoPoint(e, Math.max(0, t - 1e-3))
    const dx = x2 - x0, dy = y2 - y0, len = Math.hypot(dx, dy) || 1
    const nx = dy / len, ny = -dx / len
    const w = Math.max(ensoWidth(e, t), 0.004)
    outer.push([x + nx * w, y + ny * w])
    inner.push([x - nx * w, y - ny * w])
  }
  return [...outer, ...inner.reverse()]
}
