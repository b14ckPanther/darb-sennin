import { readFileSync } from 'node:fs'

const data = readFileSync(0, 'utf8').split(/\s+/).filter(Boolean).map(Number)
const [k, length] = data
const tiles = data.slice(2, 2 + k)
const best = new Array(length + 1).fill(length + 1)
best[0] = 0
for (let size = 1; size <= length; size++) {
  for (const t of tiles) {
    if (t <= size && best[size - t] + 1 < best[size]) best[size] = best[size - t] + 1
  }
}
console.log(best[length] <= length ? best[length] : -1)
