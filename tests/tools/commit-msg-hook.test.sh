#!/usr/bin/env bash
# Proves .githooks/commit-msg rejects attribution lines and accepts honest messages.
# Runs in a throwaway repo so it never touches this repo's history.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HOOK="$ROOT/.githooks/commit-msg"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

fail=0
git -C "$TMP" init -q
git -C "$TMP" config user.name "Test"
git -C "$TMP" config user.email "test@example.invalid"
git -C "$TMP" config core.hooksPath "$ROOT/.githooks"

try_commit() {
  local msg="$1"
  echo "$RANDOM" >> "$TMP/f.txt"
  git -C "$TMP" add f.txt
  git -C "$TMP" commit -q -m "$msg" >/dev/null 2>&1
}

expect_rejected() {
  if try_commit "$1"; then
    echo "FAIL: accepted bad message: $1"; fail=1
  else
    echo "ok: rejected: $(printf '%s' "$1" | head -n1)"
  fi
}

expect_accepted() {
  if try_commit "$1"; then
    echo "ok: accepted: $1"
  else
    echo "FAIL: rejected good message: $1"; fail=1
  fi
}

[ -x "$HOOK" ] || { echo "FAIL: $HOOK missing or not executable"; exit 1; }

expect_accepted "Add sandbox profile validator"
expect_rejected $'Add thing\n\nCo-Authored-By: Someone <x@y.z>'
expect_rejected $'Add thing\n\nco-authored-by: someone'
expect_rejected "Tweak CLAUDE.md wording"
expect_rejected "Use Anthropic SDK"
expect_rejected $'Add thing\n\nGenerated with some tool'

exit "$fail"
