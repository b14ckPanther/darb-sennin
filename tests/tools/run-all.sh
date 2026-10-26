#!/usr/bin/env bash
# Runs every shell test in tests/tools and fails if any fails.
set -uo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
status=0; n=0
for t in "$DIR"/*.test.sh; do
  n=$((n+1))
  if bash "$t" >/dev/null 2>&1; then echo "pass  $(basename "$t")"; else echo "FAIL  $(basename "$t")"; bash "$t"; status=1; fi
done
echo "$n tool test file(s), status $status"
exit "$status"
