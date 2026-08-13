import type { PixelBuffer } from "./types";

/** Edge-priority gutters from 视觉基础 · 宽屏与多尺寸适配. */
export type AdaptiveGutters = {
  left: number;
  right: number;
};

export type AdaptiveRemapMeta = {
  strategy: "edge-fixed-stretch";
  sourceGutters: AdaptiveGutters;
  targetGutters: AdaptiveGutters;
  densityY: number;
  fullBleedRows: number;
};

const MIN_GUTTER = 8;
const MAX_GUTTER_RATIO = 0.28;
const CONTENT_LUMA_DELTA = 18;

/**
 * Remap a narrow reference frame onto a wider implementation canvas.
 * - Edge gutters stay fixed (icons / spacing / non-full-width controls).
 * - Center band stretches (text width, full-width buttons, dividers).
 * - Full-bleed rows (nav / bars spanning nearly full width) stretch edge-to-edge.
 * - Vertical axis stays proportional.
 */
export function remapAdaptiveLayout(
  source: PixelBuffer,
  targetWidth: number,
  targetHeight: number,
): { buffer: PixelBuffer; meta: AdaptiveRemapMeta } {
  const densityY = targetHeight / Math.max(1, source.height);
  const sourceGutters = inferEdgeGutters(source);
  const targetGutters: AdaptiveGutters = {
    left: clamp(
      Math.round(sourceGutters.left * Math.min(1.15, Math.max(0.85, densityY))),
      MIN_GUTTER,
      Math.floor(targetWidth * MAX_GUTTER_RATIO),
    ),
    right: clamp(
      Math.round(sourceGutters.right * Math.min(1.15, Math.max(0.85, densityY))),
      MIN_GUTTER,
      Math.floor(targetWidth * MAX_GUTTER_RATIO),
    ),
  };

  // Prefer fixed px gutters when density is near 1 (same DPR screenshots).
  if (Math.abs(densityY - 1) < 0.08) {
    targetGutters.left = clamp(
      sourceGutters.left,
      MIN_GUTTER,
      Math.floor(targetWidth * MAX_GUTTER_RATIO),
    );
    targetGutters.right = clamp(
      sourceGutters.right,
      MIN_GUTTER,
      Math.floor(targetWidth * MAX_GUTTER_RATIO),
    );
  }

  const fullBleed = detectFullBleedRows(source, sourceGutters);
  const data = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  let fullBleedRows = 0;

  for (let y = 0; y < targetHeight; y += 1) {
    const sy = Math.min(
      source.height - 1,
      Math.floor((y / targetHeight) * source.height),
    );
    const isFullBleed = fullBleed[sy] === 1;
    if (isFullBleed) fullBleedRows += 1;

    const leftSrc = isFullBleed ? 0 : sourceGutters.left;
    const rightSrc = isFullBleed ? 0 : sourceGutters.right;
    const leftDst = isFullBleed ? 0 : targetGutters.left;
    const rightDst = isFullBleed ? 0 : targetGutters.right;

    for (let x = 0; x < targetWidth; x += 1) {
      const sx = inverseMapX(
        x,
        source.width,
        targetWidth,
        leftSrc,
        rightSrc,
        leftDst,
        rightDst,
      );
      const sourceOffset = (sy * source.width + sx) * 4;
      const targetOffset = (y * targetWidth + x) * 4;
      data[targetOffset] = source.data[sourceOffset]!;
      data[targetOffset + 1] = source.data[sourceOffset + 1]!;
      data[targetOffset + 2] = source.data[sourceOffset + 2]!;
      data[targetOffset + 3] = source.data[sourceOffset + 3]!;
    }
  }

  return {
    buffer: { width: targetWidth, height: targetHeight, data },
    meta: {
      strategy: "edge-fixed-stretch",
      sourceGutters,
      targetGutters,
      densityY,
      fullBleedRows,
    },
  };
}

export function shouldUseAdaptiveLayout(
  reference: PixelBuffer,
  implementation: PixelBuffer,
) {
  const widthRatio =
    implementation.width / Math.max(1, reference.width);
  const heightRatio =
    implementation.height / Math.max(1, reference.height);
  const widthDelta = Math.abs(implementation.width - reference.width);
  if (widthDelta < 3) return false;
  // Uniform zoom of the whole frame → keep global scale baseline.
  const relativeSkew =
    Math.abs(widthRatio - heightRatio) / Math.max(widthRatio, heightRatio);
  return relativeSkew >= 0.03;
}

export function inferEdgeGutters(buffer: PixelBuffer): AdaptiveGutters {
  const background = sampleBackground(buffer);
  const maxGutter = Math.floor(buffer.width * MAX_GUTTER_RATIO);
  const left = measureInset(buffer, background, "left", maxGutter);
  const right = measureInset(buffer, background, "right", maxGutter);
  return {
    left: Math.max(MIN_GUTTER, left),
    right: Math.max(MIN_GUTTER, right),
  };
}

function detectFullBleedRows(
  buffer: PixelBuffer,
  gutters: AdaptiveGutters,
): Uint8Array {
  const background = sampleBackground(buffer);
  const rows = new Uint8Array(buffer.height);
  const edgeProbe = Math.max(2, Math.floor(Math.min(gutters.left, gutters.right) * 0.5));

  for (let y = 0; y < buffer.height; y += 1) {
    let edgeHits = 0;
    for (let x = 0; x < edgeProbe; x += 1) {
      if (!isNearBackground(buffer, x, y, background)) edgeHits += 1;
      if (
        !isNearBackground(buffer, buffer.width - 1 - x, y, background)
      ) {
        edgeHits += 1;
      }
    }
    // Content touches both edges → treat as full-bleed stretch band.
    rows[y] = edgeHits >= Math.max(2, edgeProbe) ? 1 : 0;
  }
  return rows;
}

function inverseMapX(
  x: number,
  sourceWidth: number,
  targetWidth: number,
  leftSrc: number,
  rightSrc: number,
  leftDst: number,
  rightDst: number,
) {
  const srcContent = Math.max(1, sourceWidth - leftSrc - rightSrc);
  const dstContent = Math.max(1, targetWidth - leftDst - rightDst);

  if (leftDst > 0 && x < leftDst) {
    return clamp(Math.floor((x / leftDst) * leftSrc), 0, sourceWidth - 1);
  }
  if (rightDst > 0 && x >= targetWidth - rightDst) {
    const t = (x - (targetWidth - rightDst)) / rightDst;
    return clamp(
      Math.floor(sourceWidth - rightSrc + t * rightSrc),
      0,
      sourceWidth - 1,
    );
  }
  const t = (x - leftDst) / dstContent;
  return clamp(Math.floor(leftSrc + t * srcContent), 0, sourceWidth - 1);
}

function measureInset(
  buffer: PixelBuffer,
  background: [number, number, number],
  side: "left" | "right",
  maxGutter: number,
) {
  const stepY = Math.max(1, Math.floor(buffer.height / 48));
  const votes = new Map<number, number>();

  for (let y = 0; y < buffer.height; y += stepY) {
    let inset = maxGutter;
    for (let i = 0; i < maxGutter; i += 1) {
      const x = side === "left" ? i : buffer.width - 1 - i;
      if (!isNearBackground(buffer, x, y, background)) {
        inset = i;
        break;
      }
    }
    votes.set(inset, (votes.get(inset) ?? 0) + 1);
  }

  let best = MIN_GUTTER;
  let bestCount = -1;
  for (const [inset, count] of votes) {
    if (count > bestCount) {
      best = inset;
      bestCount = count;
    }
  }
  return best;
}

function sampleBackground(buffer: PixelBuffer): [number, number, number] {
  const points = [
    [2, 2],
    [buffer.width - 3, 2],
    [2, buffer.height - 3],
    [buffer.width - 3, buffer.height - 3],
    [Math.floor(buffer.width / 2), 2],
  ] as const;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of points) {
    const offset =
      (clamp(y, 0, buffer.height - 1) * buffer.width +
        clamp(x, 0, buffer.width - 1)) *
      4;
    r += buffer.data[offset]!;
    g += buffer.data[offset + 1]!;
    b += buffer.data[offset + 2]!;
  }
  return [
    Math.round(r / points.length),
    Math.round(g / points.length),
    Math.round(b / points.length),
  ];
}

function isNearBackground(
  buffer: PixelBuffer,
  x: number,
  y: number,
  background: [number, number, number],
) {
  const offset = (y * buffer.width + x) * 4;
  const dr = Math.abs(buffer.data[offset]! - background[0]);
  const dg = Math.abs(buffer.data[offset + 1]! - background[1]);
  const db = Math.abs(buffer.data[offset + 2]! - background[2]);
  return Math.max(dr, dg, db) <= CONTENT_LUMA_DELTA;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
