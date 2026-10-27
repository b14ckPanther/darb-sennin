import sys

def main():
    lines = sys.stdin.read().split("\n")
    k = int(lines[0])
    times = {}
    for line in lines[1:]:
        parts = line.split()
        if len(parts) != 4 or not parts[2].isdigit() or not parts[3].isdigit():
            continue
        times.setdefault(f"{parts[0]} {parts[1]}", []).append(int(parts[3]))
    def median(values):
        values = sorted(values)
        mid = len(values) // 2
        return values[mid] * 2 if len(values) % 2 else values[mid - 1] + values[mid]
    ranked = sorted(times, key=lambda e: (-median(times[e]), e.encode()))
    sys.stdout.write("".join(e + "\n" for e in ranked[:k]))

main()
