import type { PageCanvasPlan } from "./page-canvas-parser";
import type { ReferenceLayoutAnalysis } from "./page-canvas-reference-inference";
import { estimateLayoutBands } from "./page-canvas-reference-inference";

export const YUEBAN_ARTBOARD_WIDTH = 750;

export type YuebanBBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type YuebanLayer = {
  id: string;
  type: "bitmap" | "text" | "vector" | "component";
  source_bbox: YuebanBBox;
  scaled_bbox: YuebanBBox;
  z_index: number;
  asset?: string;
  transparent_required?: boolean;
  componentId?: string;
  specPath?: string;
  notes?: string;
  text?: string;
};

export type YuebanArtboardMeta = {
  source_width: number;
  source_height: number;
  scale: number;
  artboard_width: number;
  artboard_height: number;
  workflow: "yueban-image-to-code";
  ds_mode: "component-stack";
  plan_intent?: string;
};

export function computeYuebanScale(sourceWidth: number) {
  return YUEBAN_ARTBOARD_WIDTH / sourceWidth;
}

export function scaleBBox(bbox: YuebanBBox, scale: number): YuebanBBox {
  return {
    x: Math.round(bbox.x * scale),
    y: Math.round(bbox.y * scale),
    width: Math.round(bbox.width * scale),
    height: Math.round(bbox.height * scale),
  };
}

function fullWidthBand(
  sourceWidth: number,
  y0: number,
  y1: number,
): YuebanBBox {
  const y = Math.round(y0);
  const height = Math.max(1, Math.round(y1 - y0));
  return { x: 0, y, width: sourceWidth, height };
}

function rowBand(
  sourceWidth: number,
  y0: number,
  rowIndex: number,
  rowCount: number,
  regionTop: number,
  regionBottom: number,
): YuebanBBox {
  const regionHeight = regionBottom - regionTop;
  const rowHeight = regionHeight / rowCount;
  const y = regionTop + rowIndex * rowHeight;
  return {
    x: 0,
    y: Math.round(y),
    width: sourceWidth,
    height: Math.max(1, Math.round(rowHeight)),
  };
}

/** Yueban 兼容的 layers 数组（preview_bboxes.py 接受 JSON list）。 */
export function buildYuebanLayerList(input: {
  sourceWidth: number;
  sourceHeight: number;
  analysis: ReferenceLayoutAnalysis;
  plan: PageCanvasPlan;
}): YuebanLayer[] {
  const { sourceWidth, sourceHeight, analysis, plan } = input;
  const scale = computeYuebanScale(sourceWidth);
  const bands = estimateLayoutBands(sourceHeight, analysis);
  const layers: YuebanLayer[] = [];
  let z = 1;

  const pushLayer = (layer: Omit<YuebanLayer, "scaled_bbox">) => {
    layers.push({
      ...layer,
      scaled_bbox: scaleBBox(layer.source_bbox, scale),
    });
  };

  pushLayer({
    id: "artboard-reference",
    type: "bitmap",
    source_bbox: { x: 0, y: 0, width: sourceWidth, height: sourceHeight },
    z_index: z++,
    asset: "assets/reference/source.png",
    transparent_required: false,
    notes: "整图参考；750 画板叠图验收基准",
  });

  for (const block of plan.blocks) {
    switch (block.kind) {
      case "regular-navigation": {
        const bbox = fullWidthBand(
          sourceWidth,
          bands.statusSkip,
          bands.topNavEnd,
        );
        pushLayer({
          id: `layer-${block.componentId}-nav`,
          type: "component",
          source_bbox: bbox,
          z_index: z++,
          componentId: block.componentId,
          specPath: `specs/components/${block.componentId}.yaml`,
          notes: `DS 组件还原 · 标题「${block.title}」`,
        });
        break;
      }
      case "secondary-tab": {
        const bbox = fullWidthBand(
          sourceWidth,
          bands.topNavEnd,
          bands.tabEnd,
        );
        pushLayer({
          id: `layer-${block.componentId}`,
          type: "component",
          source_bbox: bbox,
          z_index: z++,
          componentId: block.componentId,
          specPath: `specs/components/${block.componentId}.yaml`,
          notes: `Tab: ${block.labels.filter(Boolean).join(" / ")}`,
        });
        break;
      }
      case "search-control": {
        const bbox = fullWidthBand(
          sourceWidth,
          bands.topNavEnd,
          bands.searchEnd,
        );
        pushLayer({
          id: `layer-${block.componentId}`,
          type: "component",
          source_bbox: bbox,
          z_index: z++,
          componentId: block.componentId,
          specPath: `specs/components/${block.componentId}.yaml`,
        });
        break;
      }
      case "regular-list": {
        for (let row = 0; row < block.rows; row += 1) {
          const bbox = rowBand(
            sourceWidth,
            bands.contentTop,
            row,
            block.rows,
            bands.contentTop,
            bands.contentBottom,
          );
          pushLayer({
            id: `layer-${block.componentId}-row-${row + 1}`,
            type: "component",
            source_bbox: bbox,
            z_index: z++,
            componentId: block.componentId,
            specPath: `specs/components/${block.componentId}.yaml`,
            notes: `列表行 ${row + 1}/${block.rows}`,
          });
        }
        break;
      }
      case "button-bar": {
        const y1 = analysis.hasBottomNavigation
          ? bands.bottomStart
          : sourceHeight;
        const y0 = y1 - sourceHeight * 0.09;
        pushLayer({
          id: "layer-button-bar",
          type: "component",
          source_bbox: fullWidthBand(sourceWidth, y0, y1),
          z_index: z++,
          componentId: block.componentId,
          specPath: `specs/components/${block.componentId}.yaml`,
        });
        break;
      }
      case "bottom-navigation": {
        pushLayer({
          id: "layer-bottom-navigation",
          type: "component",
          source_bbox: fullWidthBand(
            sourceWidth,
            bands.bottomStart,
            sourceHeight,
          ),
          z_index: z++,
          componentId: block.componentId,
          specPath: `specs/components/${block.componentId}.yaml`,
        });
        break;
      }
      case "primary-navigation": {
        pushLayer({
          id: "layer-primary-navigation",
          type: "component",
          source_bbox: fullWidthBand(
            sourceWidth,
            bands.statusSkip,
            bands.topNavEnd,
          ),
          z_index: z++,
          componentId: block.componentId,
          specPath: `specs/components/${block.componentId}.yaml`,
        });
        break;
      }
      default:
        break;
    }
  }

  return layers;
}

export function buildYuebanArtboardMeta(input: {
  sourceWidth: number;
  sourceHeight: number;
  plan: PageCanvasPlan;
}): YuebanArtboardMeta {
  const scale = computeYuebanScale(input.sourceWidth);
  return {
    source_width: input.sourceWidth,
    source_height: input.sourceHeight,
    scale,
    artboard_width: YUEBAN_ARTBOARD_WIDTH,
    artboard_height: Math.round(input.sourceHeight * scale),
    workflow: "yueban-image-to-code",
    ds_mode: "component-stack",
    plan_intent: input.plan.intent,
  };
}

export function buildYuebanManifestBundle(input: {
  sourceWidth: number;
  sourceHeight: number;
  analysis: ReferenceLayoutAnalysis;
  plan: PageCanvasPlan;
  referenceFileName?: string;
}) {
  const artboard = buildYuebanArtboardMeta({
    sourceWidth: input.sourceWidth,
    sourceHeight: input.sourceHeight,
    plan: input.plan,
  });
  const layers = buildYuebanLayerList({
    sourceWidth: input.sourceWidth,
    sourceHeight: input.sourceHeight,
    analysis: input.analysis,
    plan: input.plan,
  });
  return {
    artboard,
    layers,
    referenceFileName: input.referenceFileName,
    generatedAt: new Date().toISOString(),
  };
}

export function buildYuebanAgentPrompt(input: {
  referenceFileName: string;
  sourceWidth: number;
  sourceHeight: number;
  plan: PageCanvasPlan;
  portalViewport: { width: number; height: number };
}): string {
  const scale = computeYuebanScale(input.sourceWidth);
  return [
    "使用 yueban-image-to-code skill（仓库已安装于 .agents/skills/yueban-image-to-code）。",
    "",
    "## 源图",
    `- 文件：${input.referenceFileName}`,
    `- 原始尺寸：${input.sourceWidth}×${input.sourceHeight}`,
    `- 750 画板：宽 ${YUEBAN_ARTBOARD_WIDTH}，高 ${Math.round(input.sourceHeight * scale)}，scale=${scale.toFixed(6)}`,
    "",
    "## 本仓库混合模式（Design System）",
    "- Portal 已导出 layers.manifest.json（组件层 bbox 为启发式，位图层需你在 Agent 侧按原图精修 source_bbox）。",
    "- 原型设计使用 specs/components 展示组件预览；Yueban 负责 750 叠图、切图与像素验收。",
    `- 当前意图 \`${input.plan.intent}\` · 标题「${input.plan.title}」`,
    `- Portal 交互视口 ${input.portalViewport.width}×${input.portalViewport.height}（逻辑宽；叠图对比时可缩放到 750 宽）`,
    "",
    "## 执行（skill 流程）",
    "1. 精修 manifest 中 bitmap/text 层 source_bbox",
    "2. `python3 scripts/yueban/preview_bboxes.py <源图> layers.manifest.json out/bbox-preview.png`",
    "3. 按 manifest 导出透明 PNG（extract_png_asset.py）",
    "4. 组件区继续遵循 specs/foundations + specs/components；整页用 compare-images 叠图验收",
    "5. `npm run verify:screenshot -- <750参考> <750实现截图>`",
    "",
    "## 组件契约",
    ...[
      ...new Set(input.plan.blocks.map((block) => block.componentId)),
    ].map((id) => `- specs/components/${id}.yaml`),
  ].join("\n");
}
