# Yueban scripts (vendored)

Upstream: [SemineChen/yueban-image-to-code](https://github.com/SemineChen/yueban-image-to-code)

Portal 画布导出 `layers.manifest.json` 后，可在仓库根目录运行：

```bash
pip install -r requirements-verify.txt

# bbox QA
npm run yueban:preview-bboxes -- path/to/source.png layers.manifest.json out/bbox-preview.png

# 按 bbox 切透明 PNG
npm run yueban:extract-png -- path/to/source.png out/asset.png --x 0 --y 0 --width 100 --height 100

# 切图审计
npm run yueban:audit-png -- assets/

# 整页叠图（与 Portal 浏览器对比口径一致）
npm run verify:screenshot -- reference-750.png actual-750.png
```

Cursor Agent skill：`.agents/skills/yueban-image-to-code`（`npx skills add SemineChen/yueban-image-to-code`）。
