import type { Rect, RGBA } from "./types.js";

export function area(rect: Rect): number {
  return Math.max(0, rect.width) * Math.max(0, rect.height);
}

export function intersection(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return {
    x,
    y,
    width: Math.max(0, right - x),
    height: Math.max(0, bottom - y),
  };
}

export function iou(a: Rect, b: Rect): number {
  const overlap = area(intersection(a, b));
  const union = area(a) + area(b) - overlap;
  return union <= 0 ? 0 : overlap / union;
}

export function center(rect: Rect): { x: number; y: number } {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function scaleRect(rect: Rect, factor: number, offsetY = 0): Rect {
  return {
    x: round(rect.x * factor),
    y: round(rect.y * factor + offsetY),
    width: round(rect.width * factor),
    height: round(rect.height * factor),
  };
}

export function rectToString(rect: Rect): string {
  return `x:${round(rect.x)} y:${round(rect.y)} w:${round(rect.width)} h:${round(rect.height)}`;
}

export function colorDistance(a?: RGBA, b?: RGBA): number {
  if (!a || !b) {
    return 0;
  }
  return Math.max(
    Math.abs(a.r - b.r),
    Math.abs(a.g - b.g),
    Math.abs(a.b - b.b),
  );
}

export function round(value: number): number {
  return Math.round(value * 10) / 10;
}
