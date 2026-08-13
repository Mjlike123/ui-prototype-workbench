---
name: page-canvas-vision
description: |
  页面画布照片参考 → 设计系统组件映射。在 ui-audit-tool Portal 上传 UI 截图后，用视觉能力读取原图像素尺寸，输出 PageCanvasPlan + Yueban layers.manifest（source_bbox 必须在原图坐标系测量）。
  触发：用户粘贴 Portal「Cursor 视觉分析」指令、或要求从截图还原 TopTop 组件栈。
---

# Page Canvas Vision

## 输入

- 用户提供的 UI 截图（**必须**查看图片，禁止用启发式或猜测布局）
- Portal 复制的指令中的：原图宽高、交互视口、可选文字描述
- 组件白名单见指令中的 `CANVAS_COMPONENT_CATALOG`

## 输出

**仅**输出一个 JSON 对象（可包在 ```json 代码块中），schema 见 Portal `page-canvas-agent-vision.ts` 内 `PageCanvasAgentVisionResult`。

要求：

1. `sourceImage.width/height` 与附件原图一致
2. `plan.blocks` 只能使用 catalog 中的 `componentId` 与 block 形状
3. `yuebanLayers` 为 Yueban 兼容 **数组**；每个可见区域给出在原图上的 `source_bbox`；`scaled_bbox` 用 `scale = 750 / sourceImage.width` 计算
4. `plan.matched` 注明「Cursor 视觉分析」及映射理由（简短）
5. `plan.warnings` 列出无法映射到契约的 UI 区域

## 禁止

- 像素带启发式、按比例估算 band、不看图输出
-  invent 未入库组件；无契约部分写入 warnings

## 后续

用户将 JSON 粘贴回 Portal `/canvas` → **应用 Agent 分析结果**。
