#!/usr/bin/env bash
# Proves tools/check-emoji.sh fails on a planted emoji and passes on clean text.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CHECK="$ROOT/tools/check-emoji.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
fail=0
[ -x "$CHECK" ] || { echo "FAIL: $CHECK missing or not executable"; exit 1; }

mkdir -p "$TMP/clean" "$TMP/dirty/nested"
printf 'plain text, arrows -> and dashes - only\n' > "$TMP/clean/a.ts"
printf 'const done = "ok";\n' > "$TMP/dirty/nested/b.ts"
# Planted fixture: U+1F525 written as raw UTF-8 bytes so this test file stays emoji-free.
printf 'title: hot \xf0\x9f\x94\xa5\n' > "$TMP/dirty/nested/c.yaml"
# Variation selector U+FE0F and dingbat U+2705 must also be caught.
printf 'x \xe2\x9c\x85\n' > "$TMP/dirty/d.md"

if "$CHECK" "$TMP/clean" >/dev/null 2>&1; then echo "ok: clean tree passes"; else echo "FAIL: clean tree flagged"; fail=1; fi

out="$("$CHECK" "$TMP/dirty" 2>&1)" && { echo "FAIL: dirty tree passed"; fail=1; } || echo "ok: dirty tree fails"
echo "$out" | grep -q 'c.yaml:1' && echo "ok: reports file and line for U+1F525" || { echo "FAIL: c.yaml:1 not reported"; fail=1; }
echo "$out" | grep -q 'd.md:1' && echo "ok: reports dingbat U+2705" || { echo "FAIL: d.md:1 not reported"; fail=1; }

exit "$fail"
