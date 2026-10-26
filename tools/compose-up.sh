#!/usr/bin/env bash
# Starts the local stack and waits until MongoDB is primary and the Service Bus emulator is healthy.
# Usage: tools/compose-up.sh   (reads the repo-root .env; copy .env.example first)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="${SENNIN_ENV_FILE:-$ROOT/.env}"
[ -f "$ENV_FILE" ] || { echo "compose-up: $ENV_FILE missing. Run: cp .env.example .env" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a
COMPOSE=(docker compose --env-file "$ENV_FILE" -f "$ROOT/deploy/compose/compose.yml")

"${COMPOSE[@]}" up -d

deadline=$(( $(date +%s) + ${SENNIN_COMPOSE_WAIT_SECONDS:?set in .env} ))
until [ "$("${COMPOSE[@]}" ps -q mongo | xargs docker inspect -f '{{.State.Health.Status}}' 2>/dev/null)" = healthy ] \
   && curl -fsS -m 3 "http://localhost:${SENNIN_SERVICEBUS_HTTP_PORT}/health" >/dev/null 2>&1; do
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "compose-up: services not ready in time" >&2
    "${COMPOSE[@]}" ps >&2
    exit 1
  fi
  sleep 3
done
echo "compose-up: mongo primary and Service Bus emulator healthy"
