# Probe generator: make(n, rng) returns one input of size n. Seeded, so runs repeat exactly.
import random
def make(n, rng):
    k = max(1, n // 10)
    return f"{n} {k}\n" + " ".join(str(rng.randint(-10000, 10000)) for _ in range(n)) + "\n"
