#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOOKIN_DIR="$ROOT_DIR/vendor/Lookin"
DERIVED_DATA_DIR="$ROOT_DIR/.build/lookin"
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export LANG="${LANG:-en_US.UTF-8}"

if [[ ! -d "$LOOKIN_DIR" ]]; then
  echo "Lookin source not found at $LOOKIN_DIR" >&2
  exit 1
fi

if ! command -v pod >/dev/null 2>&1; then
  echo "CocoaPods is required to build Lookin." >&2
  echo "Install it first, then rerun this script:" >&2
  echo "  gem install cocoapods" >&2
  exit 127
fi

cd "$LOOKIN_DIR"
pod install
xcodebuild \
  -workspace "Lookin.xcworkspace" \
  -scheme "LookinClient" \
  -configuration Debug \
  -derivedDataPath "$DERIVED_DATA_DIR" \
  CODE_SIGNING_ALLOWED=NO \
  build

echo "Lookin built at $DERIVED_DATA_DIR/Build/Products/Debug/Lookin.app"
