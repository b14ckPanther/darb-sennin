import sys
from collections import deque, defaultdict

def main():
    data = sys.stdin.read().split()
    m, start, goal = int(data[0]), int(data[1]), int(data[2])
    pos = 3
    lines = []
    for _ in range(m):
        c = int(data[pos])
        lines.append(set(int(x) for x in data[pos + 1:pos + 1 + c]))
        pos += 1 + c
    if start == goal:
        print(0)
        return
    by_station = defaultdict(list)
    for i, stops in enumerate(lines):
        for s in stops:
            by_station[s].append(i)
    queue = deque((i, 0) for i in by_station[start])
    seen_lines = set(by_station[start])
    seen_stations = {start}
    while queue:
        line, changes = queue.popleft()
        if goal in lines[line]:
            print(changes)
            return
        for s in lines[line]:
            if s in seen_stations:
                continue
            seen_stations.add(s)
            for nxt in by_station[s]:
                if nxt not in seen_lines:
                    seen_lines.add(nxt)
                    queue.append((nxt, changes + 1))
    print(-1)

main()
