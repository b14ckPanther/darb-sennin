# Probe generator: make(n, rng) returns one input of size n. Seeded, so runs repeat exactly.
import random, sys
def make(n, rng):
    k = rng.randint(2, 6)
    tiles = sorted(rng.sample(range(2, 40), k))
    return f"{k} {n}\n{' '.join(map(str, tiles))}\n"
