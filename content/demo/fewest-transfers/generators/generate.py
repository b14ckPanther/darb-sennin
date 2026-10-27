# Probe generator: make(n, rng) returns one input of size n. Seeded, so runs repeat exactly.
import random
def make(n, rng):
    lines = max(2, n // 200)
    rows = []
    for i in range(lines):
        stops = rng.sample(range(n), max(2, n // lines))
        rows.append(f"{len(stops)} " + " ".join(map(str, stops)))
    return f"{lines} 0 {n - 1}\n" + "\n".join(rows) + "\n"
