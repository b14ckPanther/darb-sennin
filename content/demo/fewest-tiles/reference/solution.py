import sys

def fewest_tiles(tiles, length):
    best = [0] + [length + 1] * length
    for size in range(1, length + 1):
        for t in tiles:
            if t <= size and best[size - t] + 1 < best[size]:
                best[size] = best[size - t] + 1
    return best[length] if best[length] <= length else -1

def main():
    data = sys.stdin.read().split()
    k, length = int(data[0]), int(data[1])
    tiles = [int(x) for x in data[2:2 + k]]
    print(fewest_tiles(tiles, length))

main()
