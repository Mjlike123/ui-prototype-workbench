#!/usr/bin/env bash
# Smart launcher for design-system-portal dev server.
# Avoids duplicate next dev instances (ERR_CONNECTION_REFUSED / -102 from stale restarts).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORTAL_PORT:-3000}"
HOST="${PORTAL_HOST:-localhost}"
HEALTH_PATH="/canvas/core"
BASE_URL="http://${HOST}:${PORT}"
HEALTH_URL="${BASE_URL}${HEALTH_PATH}"
LOG_FILE="$ROOT/apps/design-system-portal/.next/dev/logs/next-development.log"
PORTAL_DIR="$ROOT/apps/design-system-portal"
LOCK_DIR="$ROOT/.portal-dev.lockdir"

usage() {
  cat <<EOF
Portal dev helper — keeps a single Next.js instance on port ${PORT}.

Commands:
  start [--clean]     Start if down; if healthy, tail logs (default)
  restart [--clean]   Stop portal on port ${PORT}, then start
  stop                Stop portal listener on port ${PORT}
  status              Print health and exit (0=up, 1=unhealthy, 2=down)

npm scripts:
  npm run portal:dev
  npm run portal:dev:restart
  npm run portal:dev:stop
  npm run portal:status

Environment:
  PORTAL_PORT=${PORT}
  PORTAL_HOST=${HOST}

If the browser shows Error -102, the dev server is not listening — run:
  npm run portal:dev
or recover with:
  npm run portal:dev:restart -- --clean
EOF
}

is_port_listening() {
  lsof -i :"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1
}

listening_pids() {
  lsof -i :"$PORT" -sTCP:LISTEN -t 2>/dev/null | tr '\n' ' ' | sed 's/[[:space:]]*$//'
}

http_status() {
  curl -s -o /dev/null -w "%{http_code}" --max-time 4 "$HEALTH_URL" 2>/dev/null || echo "000"
}

is_healthy() {
  [[ "$(http_status)" == "200" ]]
}

is_portal_listener() {
  local pid="$1"
  local args
  args="$(ps -p "$pid" -o args= 2>/dev/null || true)"
  [[ "$args" == *"next dev"* || "$args" == *"next-server"* ]]
}

wait_for_port_free() {
  local attempt=1
  while is_port_listening; do
    if (( attempt > 40 )); then
      echo "Timed out waiting for port ${PORT} to free."
      return 1
    fi
    sleep 0.25
    attempt=$((attempt + 1))
  done
}

stop_portal() {
  local pids pid
  pids="$(listening_pids)"
  if [[ -z "$pids" ]]; then
    echo "No process listening on port ${PORT}."
    return 0
  fi

  for pid in $pids; do
    if is_portal_listener "$pid"; then
      echo "Stopping portal (PID ${pid})..."
      kill "$pid" 2>/dev/null || true
    else
      echo "Port ${PORT} is used by non-portal PID ${pid}; not stopping."
      ps -p "$pid" -o args= 2>/dev/null || true
      return 1
    fi
  done

  wait_for_port_free
  echo "Port ${PORT} is free."
}

maybe_clean() {
  if [[ "${1:-}" == "--clean" ]]; then
    echo "Clearing ${PORTAL_DIR}/.next ..."
    rm -rf "${PORTAL_DIR}/.next"
  fi
}

acquire_start_lock() {
  if mkdir "$LOCK_DIR" 2>/dev/null; then
    return 0
  fi

  echo "Another portal start is in progress, waiting..."
  local attempt=1
  while (( attempt <= 120 )); do
    if is_healthy; then
      echo "Portal became healthy at ${BASE_URL}"
      return 2
    fi
    sleep 1
    if mkdir "$LOCK_DIR" 2>/dev/null; then
      return 0
    fi
    attempt=$((attempt + 1))
  done

  echo "Timed out waiting for portal start lock."
  exit 1
}

release_start_lock() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

start_portal() {
  local lock_state=0
  acquire_start_lock || lock_state=$?
  if [[ "$lock_state" == "2" ]]; then
    echo "Portal already healthy at ${BASE_URL}"
    release_start_lock
    trap - EXIT
    return 0
  fi

  trap release_start_lock EXIT

  cd "$ROOT"
  echo "Building design-system contract..."
  npm run contract:build
  echo "Starting portal at ${BASE_URL} ..."
  release_start_lock
  trap - EXIT
  exec npm run dev --workspace design-system-portal
}

tail_logs() {
  if [[ -f "$LOG_FILE" ]]; then
    echo "Tailing ${LOG_FILE} (Ctrl+C stops watching; server keeps running)"
    tail -f "$LOG_FILE"
  else
    echo "Dev log not found yet. Server should be at ${BASE_URL}"
    echo "Open ${HEALTH_URL} in your browser."
  fi
}

cmd_start() {
  maybe_clean "${1:-}"

  if is_healthy; then
    echo "Portal already healthy at ${BASE_URL}"
    if [[ -t 1 ]]; then
      tail_logs
    else
      echo "Open ${HEALTH_URL}"
    fi
    return 0
  fi

  if is_port_listening; then
    echo "Port ${PORT} is in use but ${HEALTH_URL} is not healthy."
    echo "Recover with: npm run portal:dev:restart"
    echo "Or force clean restart: npm run portal:dev:restart -- --clean"
    exit 1
  fi

  start_portal
}

cmd_restart() {
  maybe_clean "${1:-}"
  trap release_start_lock EXIT
  mkdir "$LOCK_DIR" 2>/dev/null || true
  stop_portal || true
  start_portal
}

cmd_status() {
  local code
  code="$(http_status)"
  if [[ "$code" == "200" ]]; then
    echo "healthy  ${HEALTH_URL}"
    if [[ -n "$(listening_pids)" ]]; then
      echo "pid $(listening_pids)"
    fi
    exit 0
  fi

  if is_port_listening; then
    echo "unhealthy  port ${PORT} open, GET ${HEALTH_PATH} -> ${code}"
    if [[ -n "$(listening_pids)" ]]; then
      echo "pid $(listening_pids)"
    fi
    exit 1
  fi

  echo "down  nothing listening on port ${PORT} (browser Error -102)"
  exit 2
}

main() {
  local command="${1:-start}"
  shift || true

  case "$command" in
    start) cmd_start "${1:-}" ;;
    restart) cmd_restart "${1:-}" ;;
    stop) stop_portal ;;
    status) cmd_status ;;
    -h|--help|help) usage ;;
    *)
      echo "Unknown command: ${command}"
      usage
      exit 1
      ;;
  esac
}

main "$@"
