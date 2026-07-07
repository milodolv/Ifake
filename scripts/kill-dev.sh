#!/usr/bin/env bash
# Arrête tous les serveurs Next.js liés à ce projet

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Nettoyage des serveurs de dev…"

for PORT in 3000 3001 3002; do
  PIDS=$(lsof -ti :"$PORT" 2>/dev/null || true)
  if [ -n "$PIDS" ]; then
    echo "  Port $PORT : arrêt"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
  fi
done

# Tuer les processus "next dev" dont le cwd est ce projet
if command -v pgrep >/dev/null 2>&1; then
  for PID in $(pgrep -f "next dev" 2>/dev/null || true); do
    CWD=$(lsof -p "$PID" 2>/dev/null | awk '/cwd/{print $9; exit}')
    if [ "$CWD" = "$PROJECT_ROOT" ]; then
      echo "  PID $PID (next dev) : arrêt"
      kill -9 "$PID" 2>/dev/null || true
    fi
  done
fi

echo "→ Serveurs arrêtés"
