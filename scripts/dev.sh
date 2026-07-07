#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# 1. Tuer tous les anciens serveurs
bash "$PROJECT_ROOT/scripts/kill-dev.sh"

# 2. Supprimer le cache corrompu (cause de "Cannot find module './XXX.js'")
rm -rf .next
echo "→ Cache .next supprimé"

# 3. Démarrer UN seul serveur
echo "→ Démarrage sur http://localhost:3000"
echo "  (utilise toujours npm run dev — jamais next dev directement)"
exec npx next dev -p 3000
