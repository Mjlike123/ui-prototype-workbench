#!/usr/bin/env bash
set -euo pipefail

FILE_KEY="Tc3TmhS6Bi39yfgqDxCaWZ"
BASE_URL="${BASE_URL:-http://localhost:3000/prototype-runtime/app/feed-compose}"
ENDPOINT_PREFIX="https://mcp.figma.com/mcp/capture"
SELECTOR="&figmaselector=.pageCanvasDevice&figmadelay=2500"

scenes=(
  "empty"
  "filled"
  "photo-picker"
  "photo-picker-selected"
  "audience"
  "leave"
)

labels=(
  "01 发布页-空态"
  "02 发布页-已填内容"
  "03 相册选择"
  "04 相册已选1张"
  "05 可见范围半窗"
  "06 离开确认半窗"
)

echo "生成 Figma capture 链接（目标文件: ${FILE_KEY}）"
echo "请确保 Portal 已运行: npm run portal:dev"
echo

for index in "${!scenes[@]}"; do
  scene="${scenes[$index]}"
  label="${labels[$index]}"
  echo "[$((index + 1))/${#scenes[@]}] ${label}"
  echo "  预览: ${BASE_URL}?scene=${scene}"
  echo "  在 Cursor 中请求新的 captureId 后，打开："
  echo "  ${BASE_URL}?scene=${scene}#figmacapture=<captureId>&figmaendpoint=https%3A%2F%2Fmcp.figma.com%2Fmcp%2Fcapture%2F<captureId>%2Fsubmit%3FbindVariables%3Dtrue${SELECTOR}"
  echo
done

echo "Figma 文件: https://www.figma.com/design/${FILE_KEY}/toptop-ai调研"
