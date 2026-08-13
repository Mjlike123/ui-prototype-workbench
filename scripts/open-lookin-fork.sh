#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOOKIN_APP="$ROOT_DIR/.build/lookin/Build/Products/Debug/Lookin.app"

if [[ ! -d "$LOOKIN_APP" ]]; then
  echo "Lookin app not found at $LOOKIN_APP" >&2
  echo "Run npm run lookin:build first." >&2
  exit 1
fi

open "$LOOKIN_APP"
echo "Opened $LOOKIN_APP"
