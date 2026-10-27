import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    steps = [int(x) for x in data[1:1 + n]]
    first_at = {}
    for j, value in enumerate(steps):
        if -value in first_at:
            print(first_at[-value], j)
            return
        first_at.setdefault(value, j)
    print(-1)

main()
