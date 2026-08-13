export type PageCanvasSizePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
};

export const PAGE_CANVAS_SIZE_PRESETS: PageCanvasSizePreset[] = [
  { id: "320", label: "320 × 568（最小宽 / SE）", width: 320, height: 568 },
  { id: "360", label: "360 × 780（Android 常见）", width: 360, height: 780 },
  { id: "375", label: "375 × 812（设计基准 · 默认）", width: 375, height: 812 },
  { id: "390", label: "390 × 844（iPhone 14）", width: 390, height: 844 },
  { id: "414", label: "414 × 896（Plus / Max）", width: 414, height: 896 },
];

export const DEFAULT_PAGE_CANVAS_PRESET_ID = "375";

export const PAGE_CANVAS_WIDTH_MIN = 320;
export const PAGE_CANVAS_WIDTH_MAX = 480;
export const PAGE_CANVAS_HEIGHT_MIN = 480;
export const PAGE_CANVAS_HEIGHT_MAX = 960;

export function getPageCanvasPreset(id: string) {
  return PAGE_CANVAS_SIZE_PRESETS.find((preset) => preset.id === id);
}

export function clampPageCanvasDimension(
  value: number,
  axis: "width" | "height",
) {
  if (!Number.isFinite(value)) {
    return axis === "width" ? 375 : 812;
  }
  const rounded = Math.round(value);
  if (axis === "width") {
    return Math.min(
      PAGE_CANVAS_WIDTH_MAX,
      Math.max(PAGE_CANVAS_WIDTH_MIN, rounded),
    );
  }
  return Math.min(
    PAGE_CANVAS_HEIGHT_MAX,
    Math.max(PAGE_CANVAS_HEIGHT_MIN, rounded),
  );
}

export function findMatchingPresetId(width: number, height: number) {
  const match = PAGE_CANVAS_SIZE_PRESETS.find(
    (preset) => preset.width === width && preset.height === height,
  );
  return match?.id ?? "custom";
}
