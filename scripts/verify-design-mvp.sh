#!/usr/bin/env bash
# Design MVP 本地门禁：契约 + Portal 单测 +（可选）截图对比
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== 1/3 Design system contract =="
npm run specs:validate

echo "== 2/3 Portal unit tests (page canvas + MVP + Yueban) =="
npm run portal:test -- --run src/lib/page-canvas src/lib/design-mvp-bundle src/lib/yueban-layers-manifest src/lib/page-canvas-agent-vision

echo "== 3/3 Root contract tests =="
npm run contract:build
npx vitest run test/design-system-contract.test.ts

if [[ "${1:-}" == "--with-screenshot" ]]; then
  echo "== Optional: screenshot compare =="
  REF="${SCREENSHOT_REF:-samples/design-mvp/reference-375.png}"
  ACT="${SCREENSHOT_ACT:-samples/design-mvp/actual-375.png}"
  if [[ ! -f "$REF" || ! -f "$ACT" ]]; then
    echo "Skip: place reference and actual PNGs at:"
    echo "  SCREENSHOT_REF=$REF"
    echo "  SCREENSHOT_ACT=$ACT"
    echo "Or export from Portal /canvas (375×812, scale 100%) then run:"
    echo "  npm run verify:screenshot -- samples/design-mvp/reference-375.png out/canvas.png"
    exit 0
  fi
  python3 scripts/compare-images.py "$REF" "$ACT" --json --fail-ratio 0.08
fi

echo "Design MVP verify: OK"
