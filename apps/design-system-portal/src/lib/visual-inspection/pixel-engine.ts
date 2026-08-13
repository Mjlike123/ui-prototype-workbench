import {
  remapAdaptiveLayout,
  shouldUseAdaptiveLayout,
} from "./adaptive-remap";
import type {
  InspectPixelInput,
  InspectionBox,
  InspectionIssue,
  InspectionIssueType,
  InspectionMode,
  InspectionResult,
  InspectionSeverity,
  PixelBuffer,
} from "./types";

const DEFAULT_THRESHOLD = 24;
const DEFAULT_CELL_SIZE = 8;
const MIN_CHANGED_PIXELS = 6;

type CellStats = {
  changed: number;
  sampled: number;
  delta: number;
};

export function inspectPixelBuffers(input: InspectPixelInput): InspectionResult {
  const implementation = input.implementation;
  const width = implementation.width;
  const height = implementation.height;
  const mode = resolveMode(input.reference, implementation);
  let reference: PixelBuffer;
  let adaptive: InspectionResult["adaptive"];
  let engineVersion: InspectionResult["engineVersion"] = "pixel-baseline-v1";

  if (mode === "exact") {
    reference = input.reference;
  } else if (mode === "adaptive-layout") {
    const remapped = remapAdaptiveLayout(input.reference, width, height);
    reference = remapped.buffer;
    adaptive = remapped.meta;
    engineVersion = "pixel-adaptive-v1";
  } else {
    reference = resizeNearest(input.reference, width, height);
  }

  const threshold = input.threshold ?? DEFAULT_THRESHOLD;
  const cellSize = Math.max(4, input.cellSize ?? DEFAULT_CELL_SIZE);
  const ignoredTop = inferIgnoredTop(width, height);
  const ignoreRegions = [
    ...(ignoredTop > 0 ? [{ x: 0, y: 0, width, height: ignoredTop }] : []),
    ...(input.ignoreRegions ?? []),
  ];
  const columns = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const cells = Array.from(
    { length: columns * rows },
    (): CellStats => ({
      changed: 0,
      sampled: 0,
      delta: 0,
    }),
  );
  let changedPixels = 0;
  let comparedPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isIgnored(x, y, ignoreRegions)) continue;
      const offset = (y * width + x) * 4;
      const delta = maxChannelDelta(reference.data, implementation.data, offset);
      const cell = cells[Math.floor(y / cellSize) * columns + Math.floor(x / cellSize)]!;
      cell.sampled += 1;
      comparedPixels += 1;
      if (delta > threshold) {
        cell.changed += 1;
        cell.delta += delta;
        changedPixels += 1;
      }
    }
  }

  const hot = cells.map((cell) => {
    if (cell.changed < MIN_CHANGED_PIXELS || cell.sampled === 0) return false;
    const coverage = cell.changed / cell.sampled;
    const meanChangedDelta = cell.delta / cell.changed;
    return coverage >= 0.1 && meanChangedDelta >= threshold * 1.25;
  });
  const regions = collectRegions(hot, cells, columns, rows, cellSize, width, height);
  const issues = regions
    .map((region, index) =>
      buildIssue(
        region.box,
        region.changed,
        region.sampled,
        region.meanDelta,
        width,
        height,
        index,
        mode,
        adaptive,
      ),
    )
    .filter((issue) => issue.bbox.width * issue.bbox.height >= 24)
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.score - a.score)
    .map((issue, index) => ({ ...issue, id: `issue-${index + 1}` }));

  return {
    schemaVersion: 1,
    engineVersion,
    createdAt: input.createdAt ?? new Date().toISOString(),
    mode,
    confidence: confidenceForMode(mode, adaptive),
    warnings: warningsForMode(mode),
    ignoredTop,
    reference: {
      fileName: input.referenceFileName ?? "reference",
      width: input.reference.width,
      height: input.reference.height,
    },
    implementation: {
      fileName: input.implementationFileName ?? "implementation",
      width,
      height,
    },
    totalChangedPixelRatio: roundRatio(changedPixels / Math.max(1, comparedPixels)),
    issues,
    ...(adaptive ? { adaptive } : {}),
  };
}

function resolveMode(
  reference: PixelBuffer,
  implementation: PixelBuffer,
): InspectionMode {
  if (
    reference.width === implementation.width &&
    reference.height === implementation.height
  ) {
    return "exact";
  }
  if (shouldUseAdaptiveLayout(reference, implementation)) {
    return "adaptive-layout";
  }
  return "scaled-baseline";
}

function confidenceForMode(
  mode: InspectionMode,
  adaptive: InspectionResult["adaptive"],
) {
  if (mode === "exact") return 95;
  if (mode === "scaled-baseline") return 40;
  const gutterBalance =
    adaptive == null
      ? 0
      : 1 -
        Math.min(
          1,
          Math.abs(adaptive.sourceGutters.left - adaptive.targetGutters.left) /
            24 +
            Math.abs(
              adaptive.sourceGutters.right - adaptive.targetGutters.right,
            ) /
              24,
        );
  return Math.round(62 + gutterBalance * 16);
}

function warningsForMode(mode: InspectionMode) {
  if (mode === "exact") {
    return ["基础像素引擎只用于辅助走查，不作为自动验收门禁。"];
  }
  if (mode === "adaptive-layout") {
    return [
      "已按「视觉基础 · 宽屏与多尺寸适配」做边缘固定 + 中间拉伸重映射；仍可能漏判复杂重排。",
      "基础像素引擎只用于辅助走查，不作为自动验收门禁。",
    ];
  }
  return [
    "两张图片接近等比缩放，使用全局缩放基线；未按宽屏固定/拉伸规则重映射。",
    "基础像素引擎只用于辅助走查，不作为自动验收门禁。",
  ];
}

function collectRegions(
  hot: boolean[],
  cells: CellStats[],
  columns: number,
  rows: number,
  cellSize: number,
  width: number,
  height: number,
) {
  const visited = new Uint8Array(hot.length);
  const regions: Array<{
    box: InspectionBox;
    changed: number;
    sampled: number;
    meanDelta: number;
  }> = [];

  for (let start = 0; start < hot.length; start += 1) {
    if (!hot[start] || visited[start]) continue;
    const queue = [start];
    visited[start] = 1;
    let minX = columns;
    let minY = rows;
    let maxX = 0;
    let maxY = 0;
    let changed = 0;
    let sampled = 0;
    let delta = 0;

    while (queue.length > 0) {
      const current = queue.pop()!;
      const cx = current % columns;
      const cy = Math.floor(current / columns);
      minX = Math.min(minX, cx);
      minY = Math.min(minY, cy);
      maxX = Math.max(maxX, cx);
      maxY = Math.max(maxY, cy);
      changed += cells[current]!.changed;
      sampled += cells[current]!.sampled;
      delta += cells[current]!.delta;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= columns || ny >= rows) continue;
          const next = ny * columns + nx;
          if (!hot[next] || visited[next]) continue;
          visited[next] = 1;
          queue.push(next);
        }
      }
    }

    regions.push({
      box: {
        x: minX * cellSize,
        y: minY * cellSize,
        width: Math.min(width, (maxX + 1) * cellSize) - minX * cellSize,
        height: Math.min(height, (maxY + 1) * cellSize) - minY * cellSize,
      },
      changed,
      sampled,
      meanDelta: delta / Math.max(1, changed),
    });
  }
  return regions;
}

function buildIssue(
  bbox: InspectionBox,
  changed: number,
  sampled: number,
  meanDelta: number,
  imageWidth: number,
  imageHeight: number,
  index: number,
  mode: InspectionMode,
  adaptive: InspectionResult["adaptive"],
): InspectionIssue {
  const regionCoverage = changed / Math.max(1, sampled);
  const imageCoverage = (bbox.width * bbox.height) / Math.max(1, imageWidth * imageHeight);
  let type: InspectionIssueType =
    regionCoverage > 0.72 ? "颜色" : meanDelta > 96 ? "内容" : "位置";

  if (mode === "adaptive-layout" && adaptive && type === "位置") {
    const inStretchBand =
      bbox.x >= adaptive.targetGutters.left - 4 &&
      bbox.x + bbox.width <=
        imageWidth - adaptive.targetGutters.right + 4;
    const mostlyHorizontal = bbox.width >= bbox.height * 1.6;
    if (inStretchBand && mostlyHorizontal) {
      type = "布局";
    }
  }

  const severity: InspectionSeverity =
    imageCoverage >= 0.02 || regionCoverage > 0.82
      ? "严重"
      : imageCoverage >= 0.003
        ? "中等"
        : "轻微";
  const score = Math.round(
    Math.min(100, regionCoverage * 65 + (meanDelta / 255) * 35),
  );
  const typeText =
    type === "颜色"
      ? "区域颜色与参考图差异明显"
      : type === "布局"
        ? "宽屏拉伸带内布局与参考重映射不一致"
        : type === "位置"
          ? "区域轮廓或位置与参考图不一致"
          : "区域可见内容与参考图不一致";
  return {
    id: `issue-${index + 1}`,
    type,
    severity,
    bbox,
    changedPixelRatio: roundRatio(regionCoverage),
    score,
    summary: `${typeText}（变化像素 ${Math.round(regionCoverage * 100)}%）`,
  };
}

function resizeNearest(source: PixelBuffer, width: number, height: number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const sy = Math.min(source.height - 1, Math.floor((y / height) * source.height));
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(source.width - 1, Math.floor((x / width) * source.width));
      const sourceOffset = (sy * source.width + sx) * 4;
      const targetOffset = (y * width + x) * 4;
      data[targetOffset] = source.data[sourceOffset]!;
      data[targetOffset + 1] = source.data[sourceOffset + 1]!;
      data[targetOffset + 2] = source.data[sourceOffset + 2]!;
      data[targetOffset + 3] = source.data[sourceOffset + 3]!;
    }
  }
  return { width, height, data };
}

function maxChannelDelta(
  reference: Uint8ClampedArray,
  implementation: Uint8ClampedArray,
  offset: number,
) {
  return Math.max(
    Math.abs(reference[offset]! - implementation[offset]!),
    Math.abs(reference[offset + 1]! - implementation[offset + 1]!),
    Math.abs(reference[offset + 2]! - implementation[offset + 2]!),
  );
}

function inferIgnoredTop(width: number, height: number) {
  if (height / Math.max(1, width) <= 1.45 || width > 1600) return 0;
  return Math.round(Math.min(height * 0.075, width * 0.12));
}

function isIgnored(x: number, y: number, regions: InspectionBox[]) {
  return regions.some(
    (region) =>
      x >= region.x &&
      y >= region.y &&
      x < region.x + region.width &&
      y < region.y + region.height,
  );
}

function severityRank(severity: InspectionSeverity) {
  return severity === "严重" ? 3 : severity === "中等" ? 2 : 1;
}

function roundRatio(value: number) {
  return Math.round(value * 1_000_000) / 1_000_000;
}
