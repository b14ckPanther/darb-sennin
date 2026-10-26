#!/usr/bin/env bash
# Proves tools/check-no-attribution.sh passes for a Nour-only history and fails otherwise.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHECK="$ROOT/tools/check-no-attribution.sh"
fail=0
[ -x "$CHECK" ] || { echo "FAIL: $CHECK missing or not executable"; exit 1; }

new_repo() {
  local d; d="$(mktemp -d)"
  git -C "$d" init -q
  git -C "$d" config user.name "Nour Alden Mousa"
  git -C "$d" config user.email "nmcryptoinvest@gmail.com"
  git -C "$d" config core.hooksPath /dev/null
  echo "$d"
}
commit() { echo "$RANDOM" >> "$1/f"; git -C "$1" add f; git -C "$1" commit -q -m "$2"; }

good="$(new_repo)"; commit "$good" "Add first file"
if "$CHECK" "$good" >/dev/null 2>&1; then echo "ok: clean history passes"; else echo "FAIL: clean history flagged"; fail=1; fi

trailer="$(new_repo)"; commit "$trailer" "Add first file"; commit "$trailer" $'Add more\n\nCo-Authored-By: Bot <b@x.y>'
if "$CHECK" "$trailer" >/dev/null 2>&1; then echo "FAIL: trailer passed"; fail=1; else echo "ok: trailer rejected"; fi

other="$(new_repo)"; commit "$other" "Add first file"
git -C "$other" config user.name "Someone Else"; commit "$other" "Add more"
if "$CHECK" "$other" >/dev/null 2>&1; then echo "FAIL: second author passed"; fail=1; else echo "ok: second author rejected"; fi

rm -rf "$good" "$trailer" "$other"
exit "$fail"
