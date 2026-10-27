import sys
from collections import deque

def main():
    data = sys.stdin.read().split()
    n, k = int(data[0]), int(data[1])
    readings = [int(x) for x in data[2:2 + n]]
    candidates = deque()
    out = []
    for i, value in enumerate(readings):
        while candidates and readings[candidates[-1]] <= value:
            candidates.pop()
        candidates.append(i)
        if candidates[0] <= i - k:
            candidates.popleft()
        if i >= k - 1:
            out.append(readings[candidates[0]])
    print(" ".join(map(str, out)))

main()
