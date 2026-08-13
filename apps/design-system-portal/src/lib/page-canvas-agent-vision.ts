import type {
  PageCanvasBlock,
  PageCanvasIntent,
  PageCanvasPlan,
} from "./page-canvas-parser";
import type { YuebanLayer, YuebanBBox } from "./yueban-layers-manifest";
import {
  computeYuebanScale,
  scaleBBox,
  YUEBAN_ARTBOARD_WIDTH,
} from "./yueban-layers-manifest";

export const CANVAS_COMPONENT_CATALOG = [
  {
    componentId: "primary-navigation",
    kind: "primary-navigation",
    spec: "specs/components/primary-navigation.yaml",
    note: "一级顶 Tab（Mine / Popular 等）",
  },
  {
    componentId: "regular-navigation",
    kind: "regular-navigation",
    spec: "specs/components/regular-navigation.yaml",
    note: "二级页标题栏：title, leading(none|back|close), trailing(none|icon|text|button)",
  },
  {
    componentId: "secondary-tab",
    kind: "secondary-tab",
    spec: "specs/components/secondary-tab.yaml",
    note: "胶囊 Tab：variant pill, labels 2-3 个",
  },
  {
    componentId: "secondary-tab-underline",
    kind: "secondary-tab",
    spec: "specs/components/secondary-tab-underline.yaml",
    note: "下划线 Tab：variant underline",
  },
  {
    componentId: "search-control",
    kind: "search-control",
    spec: "specs/components/search-control.yaml",
    note: "搜索框 placeholder",
  },
  {
    componentId: "regular-list",
    kind: "regular-list",
    spec: "specs/components/regular-list.yaml",
    note: "列表 rows, mode action|message",
  },
  {
    componentId: "button",
    kind: "button-bar",
    spec: "specs/components/button.yaml",
    note: "底部按钮栏 layout single|double, primaryLabel, secondaryLabel",
  },
  {
    componentId: "switch",
    kind: "switch",
    spec: "specs/components/switch.yaml",
    note: "设置行二元开关 checked / disabled",
  },
  {
    componentId: "bottom-navigation",
    kind: "bottom-navigation",
    spec: "specs/components/bottom-navigation.yaml",
    note: "底部五栏目的地",
  },
] as const;

export type PageCanvasAgentVisionResult = {
  schemaVersion: 1;
  sourceImage: { width: number; height: number; fileName?: string };
  plan: PageCanvasPlan;
  yuebanLayers: YuebanLayer[];
  analysisNotes?: string[];
};

const INTENTS: PageCanvasIntent[] = [
  "profile",
  "settings",
  "home-feed",
  "search",
  "custom",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBBox(value: unknown, label: string): YuebanBBox {
  if (!isRecord(value)) {
    throw new Error(`${label} 缺少 bbox 对象`);
  }
  const x = Number(value.x);
  const y = Number(value.y);
  const width = Number(value.width);
  const height = Number(value.height);
  if ([x, y, width, height].some((n) => !Number.isFinite(n))) {
    throw new Error(`${label} bbox 数值无效`);
  }
  return { x, y, width, height };
}

function parseBlock(raw: unknown, index: number): PageCanvasBlock {
  if (!isRecord(raw) || typeof raw.kind !== "string") {
    throw new Error(`blocks[${index}] 无效`);
  }
  switch (raw.kind) {
    case "primary-navigation":
      return {
        kind: "primary-navigation",
        tabCount: Math.min(5, Math.max(2, Number(raw.tabCount) || 3)),
        componentId: "primary-navigation",
      };
    case "regular-navigation":
      return {
        kind: "regular-navigation",
        title: String(raw.title ?? "页面"),
        leading: (raw.leading as "none" | "back" | "close") ?? "back",
        trailing:
          (raw.trailing as "none" | "icon" | "text" | "button") ?? "none",
        componentId: "regular-navigation",
      };
    case "secondary-tab": {
      const variant = raw.variant === "underline" ? "underline" : "pill";
      const labelsRaw = Array.isArray(raw.labels) ? raw.labels : ["A", "B"];
      const labels = [
        String(labelsRaw[0] ?? "Tab 1"),
        String(labelsRaw[1] ?? "Tab 2"),
        labelsRaw[2] != null ? String(labelsRaw[2]) : undefined,
      ] as [string, string, string?];
      return {
        kind: "secondary-tab",
        variant,
        labels,
        componentId:
          variant === "underline" ? "secondary-tab-underline" : "secondary-tab",
      };
    }
    case "search-control":
      return {
        kind: "search-control",
        placeholder: String(raw.placeholder ?? "Search"),
        componentId: "search-control",
      };
    case "regular-list":
      return {
        kind: "regular-list",
        rows: Math.min(8, Math.max(1, Number(raw.rows) || 4)),
        mode: raw.mode === "message" ? "message" : "action",
        componentId: "regular-list",
      };
    case "button-bar":
      return {
        kind: "button-bar",
        layout: raw.layout === "double" ? "double" : "single",
        primaryLabel: String(raw.primaryLabel ?? "确认"),
        secondaryLabel: String(raw.secondaryLabel ?? "取消"),
        componentId: "button",
      };
    case "bottom-navigation":
      return { kind: "bottom-navigation", componentId: "bottom-navigation" };
    default:
      throw new Error(`blocks[${index}] 未知 kind: ${raw.kind}`);
  }
}

function parseYuebanLayer(
  raw: unknown,
  index: number,
  scale: number,
): YuebanLayer {
  if (!isRecord(raw) || typeof raw.id !== "string") {
    throw new Error(`yuebanLayers[${index}] 无效`);
  }
  const source_bbox = parseBBox(raw.source_bbox, `yuebanLayers[${index}]`);
  const scaled_bbox = isRecord(raw.scaled_bbox)
    ? parseBBox(raw.scaled_bbox, `yuebanLayers[${index}].scaled_bbox`)
    : scaleBBox(source_bbox, scale);
  const type = raw.type as YuebanLayer["type"];
  if (!["bitmap", "text", "vector", "component"].includes(type)) {
    throw new Error(`yuebanLayers[${index}] type 无效`);
  }
  return {
    id: raw.id,
    type,
    source_bbox,
    scaled_bbox,
    z_index: Number(raw.z_index) || index + 1,
    asset: raw.asset != null ? String(raw.asset) : undefined,
    transparent_required: Boolean(raw.transparent_required),
    componentId:
      raw.componentId != null ? String(raw.componentId) : undefined,
    specPath: raw.specPath != null ? String(raw.specPath) : undefined,
    notes: raw.notes != null ? String(raw.notes) : undefined,
    text: raw.text != null ? String(raw.text) : undefined,
  };
}

export function extractJsonFromAgentText(text: string): unknown {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence?.[1]?.trim() ?? trimmed;
  return JSON.parse(body);
}

export function parsePageCanvasAgentVisionResult(
  input: unknown,
): PageCanvasAgentVisionResult {
  if (!isRecord(input)) {
    throw new Error("根对象必须是 JSON object");
  }
  if (input.schemaVersion !== 1) {
    throw new Error("schemaVersion 必须为 1");
  }
  if (!isRecord(input.sourceImage)) {
    throw new Error("缺少 sourceImage");
  }
  const sourceWidth = Number(input.sourceImage.width);
  const sourceHeight = Number(input.sourceImage.height);
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight)) {
    throw new Error("sourceImage.width/height 无效");
  }
  if (!isRecord(input.plan)) {
    throw new Error("缺少 plan");
  }
  const planRaw = input.plan;
  const intent = INTENTS.includes(planRaw.intent as PageCanvasIntent)
    ? (planRaw.intent as PageCanvasIntent)
    : "custom";
  if (!Array.isArray(planRaw.blocks) || planRaw.blocks.length === 0) {
    throw new Error("plan.blocks 不能为空");
  }
  const blocks = planRaw.blocks.map((block, i) => parseBlock(block, i));
  const plan: PageCanvasPlan = {
    title: String(planRaw.title ?? "页面"),
    intent,
    blocks,
    matched: Array.isArray(planRaw.matched)
      ? planRaw.matched.map(String)
      : ["Cursor 视觉分析"],
    warnings: Array.isArray(planRaw.warnings)
      ? planRaw.warnings.map(String)
      : [],
    initialState: isRecord(planRaw.initialState)
      ? {
          primaryNavIndex:
            planRaw.initialState.primaryNavIndex != null
              ? Number(planRaw.initialState.primaryNavIndex)
              : undefined,
          secondaryTabIndex:
            planRaw.initialState.secondaryTabIndex != null
              ? Number(planRaw.initialState.secondaryTabIndex)
              : undefined,
          bottomNavIndex:
            planRaw.initialState.bottomNavIndex != null
              ? Number(planRaw.initialState.bottomNavIndex)
              : undefined,
        }
      : undefined,
  };
  if (!Array.isArray(input.yuebanLayers) || input.yuebanLayers.length === 0) {
    throw new Error("yuebanLayers 不能为空（须在原图坐标系测量 bbox）");
  }
  const scale = computeYuebanScale(sourceWidth);
  const yuebanLayers = input.yuebanLayers.map((layer, i) =>
    parseYuebanLayer(layer, i, scale),
  );
  return {
    schemaVersion: 1,
    sourceImage: {
      width: sourceWidth,
      height: sourceHeight,
      fileName:
        input.sourceImage.fileName != null
          ? String(input.sourceImage.fileName)
          : undefined,
    },
    plan,
    yuebanLayers,
    analysisNotes: Array.isArray(input.analysisNotes)
      ? input.analysisNotes.map(String)
      : undefined,
  };
}

export function buildCursorVisionAnalysisPrompt(input: {
  referenceFileName: string;
  sourceWidth: number;
  sourceHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  userPrompt?: string;
}): string {
  const scale = computeYuebanScale(input.sourceWidth);
  const exampleBlock = `{
  "schemaVersion": 1,
  "sourceImage": { "width": ${input.sourceWidth}, "height": ${input.sourceHeight}, "fileName": "${input.referenceFileName}" },
  "plan": {
    "title": "…",
    "intent": "profile|settings|home-feed|search|custom",
    "blocks": [ /* 见 CANVAS_COMPONENT_CATALOG */ ],
    "matched": ["Cursor 视觉分析 · …"],
    "warnings": ["无法入库的区域…"],
    "initialState": { "bottomNavIndex": 4 }
  },
  "yuebanLayers": [
    {
      "id": "artboard-reference",
      "type": "bitmap",
      "source_bbox": { "x": 0, "y": 0, "width": ${input.sourceWidth}, "height": ${input.sourceHeight} },
      "scaled_bbox": { "x": 0, "y": 0, "width": ${YUEBAN_ARTBOARD_WIDTH}, "height": ${Math.round(input.sourceHeight * scale)} },
      "z_index": 1,
      "asset": "assets/reference/source.png"
    }
  ],
  "analysisNotes": ["…"]
}`;

  return [
    "你是 Cursor 内置视觉 Agent。请**直接查看用户附件中的 UI 截图**（不要用像素启发式或比例猜测）。",
    "",
    "## 任务",
    "将截图映射为 ui-audit-tool **设计系统组件栈**（Portal `/canvas`），并给出 Yueban 兼容的 `yuebanLayers`（在原图像素坐标系测量 `source_bbox`）。",
    "",
    "## 源图",
    `- 文件：${input.referenceFileName}`,
    `- 原图尺寸（测量基准）：**${input.sourceWidth} × ${input.sourceHeight} px**`,
    `- Portal 交互预览视口：${input.viewportWidth} × ${input.viewportHeight}（逻辑宽；组件样式以 specs 为准，非像素临摹 HTML）`,
    input.userPrompt?.trim()
      ? `- 用户描述：${input.userPrompt.trim()}`
      : "",
    "",
    "## 组件白名单 CANVAS_COMPONENT_CATALOG",
    ...CANVAS_COMPONENT_CATALOG.map(
      (c) =>
        `- \`${c.componentId}\` (${c.kind}) · ${c.spec} — ${c.note}`,
    ),
    "",
    "## 规范",
    "- specs/foundations/*.yaml",
    "- 每个 plan block 必须对应截图中可见区域；顺序自上而下",
    "- Profile 头图/封面等若无契约，写入 plan.warnings，不要 fictitious componentId",
    "- yuebanLayers：含整图 bitmap 层 + 各 component/text/bitmap 层；`scaled_bbox` = source_bbox × (750 / source_width)",
    "- 可选 skill：page-canvas-vision、yueban-image-to-code（切图精修）",
    "",
    "## 输出",
    "**只输出一个 JSON**，格式如下（不要改 schemaVersion）：",
    "",
    "```json",
    exampleBlock,
    "```",
    "",
    "用户会把 JSON 粘贴回 Portal「应用 Agent 分析结果」。",
  ]
    .filter(Boolean)
    .join("\n");
}

export function normalizeAgentVisionLayers(
  layers: YuebanLayer[],
  sourceWidth: number,
): YuebanLayer[] {
  const scale = computeYuebanScale(sourceWidth);
  return layers.map((layer) => ({
    ...layer,
    scaled_bbox: scaleBBox(layer.source_bbox, scale),
  }));
}
