import { readFileSync } from 'node:fs'

const data = readFileSync(0, 'utf8').split(/\s+/).filter(Boolean).map(Number)
const n = data[0]
const firstAt = new Map()
let answer = '-1'
for (let j = 0; j < n; j++) {
  const value = data[1 + j]
  if (firstAt.has(-value)) {
    answer = `${firstAt.get(-value)} ${j}`
    break
  }
  if (!firstAt.has(value)) firstAt.set(value, j)
}
console.log(answer)
