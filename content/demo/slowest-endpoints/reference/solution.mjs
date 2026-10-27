import { readFileSync } from 'node:fs'

const lines = readFileSync(0, 'utf8').split('\n')
const k = Number(lines[0])
const times = new Map()
for (const line of lines.slice(1)) {
  const parts = line.split(/\s+/).filter(Boolean)
  if (parts.length !== 4 || !/^\d+$/.test(parts[2]) || !/^\d+$/.test(parts[3])) continue
  const key = `${parts[0]} ${parts[1]}`
  if (!times.has(key)) times.set(key, [])
  times.get(key).push(Number(parts[3]))
}
// Twice the median, so even counts stay whole numbers.
const doubleMedian = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] * 2 : sorted[mid - 1] + sorted[mid]
}
const ranked = [...times.keys()].sort((a, b) => doubleMedian(times.get(b)) - doubleMedian(times.get(a)) || (a < b ? -1 : a > b ? 1 : 0))
process.stdout.write(ranked.slice(0, k).map((e) => `${e}\n`).join(''))
