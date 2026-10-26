#!/usr/bin/env bash
# Pre-push checks (CLAUDE.md 8): Nour is the only author and committer,
# and no commit message carries attribution or names an AI tool.
# Usage: tools/check-no-attribution.sh [repo-path]
set -euo pipefail
REPO="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
EXPECTED="${SENNIN_GIT_IDENTITY:-Nour Alden Mousa nmcryptoinvest@gmail.com}"
status=0

idents="$(git -C "$REPO" log --format='%an %ae%n%cn %ce' | sort -u)"
if [ "$idents" != "$EXPECTED" ]; then
  echo "check-no-attribution: unexpected author/committer identities:" >&2
  echo "$idents" >&2
  status=1
fi

count="$(git -C "$REPO" log --format=%B | grep -ciE 'co-authored|claude|anthropic|generated with' || true)"
if [ "$count" != "0" ]; then
  echo "check-no-attribution: $count commit message line(s) match the banned pattern" >&2
  status=1
fi

[ "$status" -eq 0 ] && echo "check-no-attribution: clean"
exit "$status"
