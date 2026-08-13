import type { PageCanvasBlock, PageCanvasPlan } from "./page-canvas-parser";
import { parsePageCanvasPrompt } from "./page-canvas-parser";

export type ReferenceLayoutAnalysis = {
  hasTopNavigation: boolean;
  hasSecondaryTabs: boolean;
  hasBottomNavigation: boolean;
  hasSearchField: boolean;
  estimatedListRows: number;
  hasButtonBar: boolean;
  confidence: number;
  notes: string[];
};

const LIST_ROW_HEIGHT_PX = 56;
const BOTTOM_NAV_RATIO = 0.11;
const TOP_NAV_RATIO = 0.075;
const TAB_BAND_RATIO = 0.055;
const SEARCH_BAND_RATIO = 0.07;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function bandAverageLuminance(
  data: ImageData,
  y0: number,
  y1: number,
  xMarginRatio = 0.05,
) {
  const { width, height, data: px } = data;
  const yStart = clamp(Math.floor(y0), 0, height - 1);
  const yEnd = clamp(Math.floor(y1), yStart + 1, height);
  const xStart = Math.floor(width * xMarginRatio);
  const xEnd = Math.floor(width * (1 - xMarginRatio));
  let sum = 0;
  let count = 0;
  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = xStart; x < xEnd; x += 1) {
      const i = (y * width + x) * 4;
      const r = px[i]!;
      const g = px[i + 1]!;
      const b = px[i + 2]!;
      sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      count += 1;
    }
  }
  return count > 0 ? sum / count : 0;
}

function bandHorizontalEdgeEnergy(data: ImageData, y0: number, y1: number) {
  const { width, height, data: px } = data;
  const yStart = clamp(Math.floor(y0), 1, height - 2);
  const yEnd = clamp(Math.floor(y1), yStart + 1, height - 1);
  let energy = 0;
  let samples = 0;
  for (let y = yStart; y < yEnd; y += 2) {
    for (let x = 1; x < width - 1; x += 3) {
      const i = (y * width + x) * 4;
      const iBelow = ((y + 1) * width + x) * 4;
      const lum =
        0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!;
      const lumBelow =
        0.2126 * px[iBelow]! +
        0.7152 * px[iBelow + 1]! +
        0.0722 * px[iBelow + 2]!;
      energy += Math.abs(lum - lumBelow);
      samples += 1;
    }
  }
  return samples > 0 ? energy / samples : 0;
}

function countListRowPeaks(data: ImageData, top: number, bottom: number) {
  const { width, height, data: px } = data;
  const yStart = clamp(Math.floor(top), 0, height - 1);
  const yEnd = clamp(Math.floor(bottom), yStart + 1, height);
  const profile: number[] = [];
  for (let y = yStart; y < yEnd; y += 1) {
    let edge = 0;
    for (let x = Math.floor(width * 0.08); x < Math.floor(width * 0.92); x += 4) {
      const i = (y * width + x) * 4;
      const iRight = (y * width + x + 1) * 4;
      const lum =
        0.2126 * px[i]! + 0.7152 * px[i + 1]! + 0.0722 * px[i + 2]!;
      const lumR =
        0.2126 * px[iRight]! +
        0.7152 * px[iRight + 1]! +
        0.0722 * px[iRight + 2]!;
      edge += Math.abs(lum - lumR);
    }
    profile.push(edge / Math.max(1, Math.floor(width / 4)));
  }
  const peaks: number[] = [];
  const minSpacing = Math.max(24, Math.floor(LIST_ROW_HEIGHT_PX * 0.65));
  for (let i = 2; i < profile.length - 2; i += 1) {
    const v = profile[i]!;
    if (
      v > profile[i - 1]! &&
      v > profile[i + 1]! &&
      v > profile[i - 2]! &&
      v > profile[i + 2]! &&
      v > 4
    ) {
      const y = yStart + i;
      if (peaks.length === 0 || y - peaks[peaks.length - 1]! >= minSpacing) {
        peaks.push(y);
      }
    }
  }
  return peaks.length;
}

export type ReferenceLayoutBands = {
  statusSkip: number;
  topNavEnd: number;
  tabEnd: number;
  searchEnd: number;
  bottomStart: number;
  contentTop: number;
  contentBottom: number;
};

export function estimateLayoutBands(
  height: number,
  analysis: Pick<
    ReferenceLayoutAnalysis,
    "hasSecondaryTabs" | "hasSearchField" | "hasBottomNavigation"
  >,
): ReferenceLayoutBands {
  const statusSkip = Math.floor(height * 0.055);
  const topNavEnd = statusSkip + height * TOP_NAV_RATIO;
  const tabEnd = topNavEnd + height * TAB_BAND_RATIO;
  const searchEnd = topNavEnd + height * SEARCH_BAND_RATIO;
  const bottomStart = height * (1 - BOTTOM_NAV_RATIO);
  const contentTop = analysis.hasSecondaryTabs
    ? tabEnd
    : analysis.hasSearchField
      ? searchEnd
      : topNavEnd;
  const contentBottom = analysis.hasBottomNavigation
    ? bottomStart
    : height * 0.92;
  return {
    statusSkip,
    topNavEnd,
    tabEnd,
    searchEnd,
    bottomStart,
    contentTop,
    contentBottom,
  };
}

/** 将参考图缩放到视口尺寸后的 ImageData 上做轻量布局启发式（无模型 API）。 */
export function analyzeReferenceLayout(
  imageData: ImageData,
): ReferenceLayoutAnalysis {
  const { height } = imageData;
  const notes: string[] = [];
  const statusSkip = Math.floor(height * 0.055);

  const topNavEnd = statusSkip + height * TOP_NAV_RATIO;
  const tabEnd = topNavEnd + height * TAB_BAND_RATIO;
  const searchEnd = topNavEnd + height * SEARCH_BAND_RATIO;
  const bottomStart = height * (1 - BOTTOM_NAV_RATIO);

  const topLum = bandAverageLuminance(imageData, statusSkip, topNavEnd);
  const midLum = bandAverageLuminance(
    imageData,
    height * 0.35,
    height * 0.55,
  );
  const bottomLum = bandAverageLuminance(imageData, bottomStart, height);
  const topEdge = bandHorizontalEdgeEnergy(imageData, statusSkip, topNavEnd);
  const tabEdge = bandHorizontalEdgeEnergy(imageData, topNavEnd, tabEnd);
  const searchEdge = bandHorizontalEdgeEnergy(imageData, topNavEnd, searchEnd);

  const hasBottomNavigation =
    Math.abs(bottomLum - midLum) > 8 && bottomLum < midLum + 40;
  const hasTopNavigation = topEdge > 3.5 || Math.abs(topLum - midLum) > 6;
  const hasSecondaryTabs = tabEdge > 4.2 && tabEdge > topEdge * 0.85;
  const hasSearchField =
    searchEdge > 5.5 &&
    bandAverageLuminance(imageData, topNavEnd, searchEnd) > midLum - 15;

  const contentTop = hasSecondaryTabs ? tabEnd : hasSearchField ? searchEnd : topNavEnd;
  const contentBottom = hasBottomNavigation ? bottomStart : height * 0.92;
  const peakRows = countListRowPeaks(imageData, contentTop, contentBottom);
  const estimatedListRows = clamp(peakRows || 4, 2, 8);

  const buttonBandStart = hasBottomNavigation
    ? bottomStart - height * 0.09
    : height * 0.88;
  const buttonEdge = bandHorizontalEdgeEnergy(
    imageData,
    buttonBandStart,
    hasBottomNavigation ? bottomStart : height,
  );
  const hasButtonBar =
    !hasBottomNavigation && buttonEdge > 4 && estimatedListRows <= 5;

  let confidence = 0.45;
  if (hasTopNavigation) confidence += 0.12;
  if (hasBottomNavigation) confidence += 0.12;
  if (hasSecondaryTabs) confidence += 0.08;
  if (peakRows >= 2) confidence += 0.1;
  confidence = clamp(confidence, 0.35, 0.88);

  notes.push(
    "基于参考图像素带的启发式推断，用于挂载设计系统组件栈；复杂定制区块仍需人工改描述。",
  );
  notes.push("对照 specs/foundations 与 specs/components/*.yaml 做视觉还原验收。");
  if (!hasTopNavigation && !hasBottomNavigation) {
    notes.push("未识别到典型顶栏/底栏，已套用默认二级页模板。");
  }

  return {
    hasTopNavigation,
    hasSecondaryTabs,
    hasBottomNavigation,
    hasSearchField,
    estimatedListRows,
    hasButtonBar,
    confidence,
    notes,
  };
}

export function buildPlanFromReferenceAnalysis(input: {
  analysis: ReferenceLayoutAnalysis;
  title?: string;
  hintPrompt?: string;
}): PageCanvasPlan {
  const { analysis, title = "参考图页面", hintPrompt } = input;
  const matched: string[] = ["照片参考 · 布局启发式还原"];
  const warnings = [...analysis.notes];
  warnings.push(
    `推断置信度约 ${Math.round(analysis.confidence * 100)}%；可叠图对照后微调语言描述并重新生成。`,
  );

  if (hintPrompt?.trim()) {
    const parsed = parsePageCanvasPrompt(hintPrompt);
    if (parsed.blocks.length > 0 && parsed.intent !== "custom") {
      matched.push("已合并语言描述中的意图模板");
      return {
        ...parsed,
        matched: [...matched, ...parsed.matched],
        warnings: [...warnings, ...parsed.warnings],
      };
    }
  }

  const blocks: PageCanvasBlock[] = [];

  if (analysis.hasTopNavigation && !analysis.hasSearchField) {
    blocks.push({
      kind: "regular-navigation",
      title,
      leading: "back",
      trailing: "icon",
      componentId: "regular-navigation",
    });
    matched.push("顶栏 → regular-navigation");
  }

  if (analysis.hasSecondaryTabs) {
    blocks.push({
      kind: "secondary-tab",
      variant: "pill",
      labels: ["动态", "资料", "相册"],
      componentId: "secondary-tab",
    });
    matched.push("分段区 → secondary-tab (pill)");
  }

  if (analysis.hasSearchField) {
    blocks.push({
      kind: "regular-navigation",
      title,
      leading: "back",
      trailing: "none",
      componentId: "regular-navigation",
    });
    blocks.push({
      kind: "search-control",
      placeholder: "Search by Name / Userid",
      componentId: "search-control",
    });
    matched.push("搜索区 → search-control");
  }

  blocks.push({
    kind: "regular-list",
    rows: analysis.estimatedListRows,
    mode: "action",
    componentId: "regular-list",
  });
  matched.push(`内容区 → regular-list · ${analysis.estimatedListRows} 行`);

  if (analysis.hasButtonBar) {
    blocks.push({
      kind: "button-bar",
      layout: "single",
      primaryLabel: "确认",
      secondaryLabel: "取消",
      componentId: "button",
    });
    matched.push("底部主按钮 → button");
  }

  if (analysis.hasBottomNavigation) {
    blocks.push({
      kind: "bottom-navigation",
      componentId: "bottom-navigation",
    });
    matched.push("底栏 → bottom-navigation");
    return {
      title,
      intent: analysis.hasSecondaryTabs ? "profile" : "home-feed",
      blocks,
      matched,
      warnings,
      initialState: { bottomNavIndex: 4, secondaryTabIndex: 1 },
    };
  }

  if (blocks.length === 1) {
    blocks.unshift({
      kind: "regular-navigation",
      title,
      leading: "back",
      trailing: "none",
      componentId: "regular-navigation",
    });
  }

  return {
    title,
    intent: "custom",
    blocks,
    matched,
    warnings,
  };
}

export function rasterizeToViewport(
  source: CanvasImageSource,
  width: number,
  height: number,
): ImageData | null {
  if (typeof document === "undefined") {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return null;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const sw =
    "width" in source && typeof source.width === "number" ? source.width : width;
  const sh =
    "height" in source && typeof source.height === "number"
      ? source.height
      : height;
  const scale = Math.min(width / sw, height / sh);
  const drawW = sw * scale;
  const drawH = sh * scale;
  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(source, dx, dy, drawW, drawH);
  return ctx.getImageData(0, 0, width, height);
}
