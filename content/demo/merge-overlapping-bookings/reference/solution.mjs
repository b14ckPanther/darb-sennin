import { readFileSync } from 'node:fs'

const data = readFileSync(0, 'utf8').split(/\s+/).filter(Boolean).map(Number)
const n = data[0]
const spans = Array.from({ length: n }, (_, i) => [data[1 + 2 * i], data[2 + 2 * i]])
spans.sort((a, b) => a[0] - b[0] || a[1] - b[1])
const merged = []
for (const [start, end] of spans) {
  const last = merged[merged.length - 1]
  if (last && start <= last[1]) last[1] = Math.max(last[1], end)
  else merged.push([start, end])
}
process.stdout.write(merged.map(([a, b]) => `${a} ${b}\n`).join(''))
