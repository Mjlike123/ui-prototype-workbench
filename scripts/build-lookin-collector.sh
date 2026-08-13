#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOOKIN_APP="/Applications/Lookin.app"
FRAMEWORK_DIR="$LOOKIN_APP/Contents/Frameworks"
OUTPUT_DIR="$ROOT_DIR/bin"

if [[ ! -d "$FRAMEWORK_DIR/LookinShared.framework" ]]; then
  echo "LookinShared.framework not found at $FRAMEWORK_DIR" >&2
  echo "Install Lookin.app in /Applications first." >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

clang \
  -fobjc-arc \
  -framework Foundation \
  -framework AppKit \
  -F "$FRAMEWORK_DIR" \
  -framework LookinShared \
  -rpath "$FRAMEWORK_DIR" \
  "$ROOT_DIR/collectors/lookin-collector/main.m" \
  -o "$OUTPUT_DIR/lookin-collector"

echo "$OUTPUT_DIR/lookin-collector"
