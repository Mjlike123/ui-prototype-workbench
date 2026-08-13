#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOOKIN_DIR="$ROOT_DIR/vendor/Lookin"
DERIVED_DATA_DIR="$ROOT_DIR/.build/lookin"

if [[ ! -d "$LOOKIN_DIR/Lookin.xcworkspace" ]]; then
  echo "Lookin workspace not found. Run npm run lookin:build first." >&2
  exit 1
fi

cd "$LOOKIN_DIR"
xcodebuild \
  -workspace "Lookin.xcworkspace" \
  -scheme "LookinClientTests" \
  -configuration Debug \
  -derivedDataPath "$DERIVED_DATA_DIR" \
  CODE_SIGNING_ALLOWED=NO \
  test
