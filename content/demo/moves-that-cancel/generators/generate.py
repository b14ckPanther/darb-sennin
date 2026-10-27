# Probe generator: make(n, rng) returns one input of size n. Seeded, so runs repeat exactly.
import random
def make(n, rng):
    # Distinct positive moves, so the answer is -1 and the whole log is scanned.
    return f"{n}\n" + " ".join(str(x) for x in rng.sample(range(1, 10 * n + 10), n)) + "\n"
