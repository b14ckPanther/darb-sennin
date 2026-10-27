import { readFileSync } from 'node:fs'

const data = readFileSync(0, 'utf8').split(/\s+/).filter(Boolean).map(Number)
const [m, start, goal] = data
let pos = 3
const lines = []
for (let i = 0; i < m; i++) {
  const c = data[pos]
  lines.push(new Set(data.slice(pos + 1, pos + 1 + c)))
  pos += 1 + c
}
const solve = () => {
  if (start === goal) return 0
  const byStation = new Map()
  lines.forEach((stops, i) => {
    for (const s of stops) {
      if (!byStation.has(s)) byStation.set(s, [])
      byStation.get(s).push(i)
    }
  })
  const first = byStation.get(start) ?? []
  const queue = first.map((l) => [l, 0])
  const seenLines = new Set(first)
  const seenStations = new Set([start])
  for (let head = 0; head < queue.length; head++) {
    const [line, changes] = queue[head]
    if (lines[line].has(goal)) return changes
    for (const s of lines[line]) {
      if (seenStations.has(s)) continue
      seenStations.add(s)
      for (const next of byStation.get(s)) {
        if (!seenLines.has(next)) {
          seenLines.add(next)
          queue.push([next, changes + 1])
        }
      }
    }
  }
  return -1
}
console.log(solve())
