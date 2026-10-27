# Probe generator: make(n, rng) returns one input of size n. Seeded, so runs repeat exactly.
import random
def make(n, rng):
    lines = []
    for _ in range(n):
        a = rng.randint(0, 1430)
        lines.append(f"{a} {min(1440, a + rng.randint(0, 30))}")
    return f"{n}\n" + "\n".join(lines) + ("\n" if lines else "")
