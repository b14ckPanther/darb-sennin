import { readFileSync } from 'node:fs'

const data = readFileSync(0, 'utf8').split(/\s+/).filter(Boolean).map(Number)
const [n, k] = data
const readings = data.slice(2, 2 + n)
// A ring of indexes with head and tail pointers: shift() would make this quadratic.
const candidates = new Int32Array(readings.length + 1)
let head = 0
let tail = 0
const out = []
for (let i = 0; i < readings.length; i++) {
  while (tail > head && readings[candidates[tail - 1]] <= readings[i]) tail--
  candidates[tail++] = i
  if (candidates[head] <= i - k) head++
  if (i >= k - 1) out.push(readings[candidates[head]])
}
console.log(out.join(' '))
