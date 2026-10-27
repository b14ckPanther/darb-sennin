import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    spans = sorted((int(data[1 + 2 * i]), int(data[2 + 2 * i])) for i in range(n))
    merged = []
    for start, end in spans:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    sys.stdout.write("".join(f"{a} {b}\n" for a, b in merged))

main()
