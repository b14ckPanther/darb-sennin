# Probe generator: make(n, rng) returns one input of size n. Seeded, so runs repeat exactly.
import random
def make(n, rng):
    methods = ["GET", "POST", "PUT"]
    lines = [f"{rng.choice(methods)} /p{rng.randint(0, n // 20)} 200 {rng.randint(1, 1000)}" for _ in range(n)]
    return "10\n" + "\n".join(lines) + "\n"
