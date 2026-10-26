#!/usr/bin/env bash
# Fails if any emoji code point appears in the given paths (default: src web config content).
# Uses perl so it behaves the same on macOS (BSD grep has no -P) and Linux CI.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
if [ "$#" -eq 0 ]; then
  set --
  for d in src web config content tests; do [ -e "$ROOT/$d" ] && set -- "$@" "$ROOT/$d"; done
fi
[ "$#" -eq 0 ] && { echo "check-emoji: nothing to scan"; exit 0; }

hits="$(find "$@" \
  \( -name node_modules -o -name bin -o -name obj -o -name dist -o -name .git \
     -o -name TestResults -o -name playwright-report -o -name test-results \) -prune -o \
  -type f \( -name '*.woff' -o -name '*.woff2' -o -name '*.png' -o -name '*.jpg' -o -name '*.ico' \) -prune -o \
  -type f -print0 \
  | xargs -0 perl -CSD -ne 'print "$ARGV:$.: $_" if /[\x{1F000}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]/; close ARGV if eof' 2>/dev/null || true)"

if [ -n "$hits" ]; then
  echo "check-emoji: emoji found (forbidden by CLAUDE.md 1.9):" >&2
  echo "$hits" >&2
  exit 1
fi
echo "check-emoji: clean"
