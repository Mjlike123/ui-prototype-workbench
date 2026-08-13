export type InspectionSeverity = "严重" | "中等" | "轻微";
export type InspectionIssueType = "颜色" | "位置" | "内容" | "布局";
export type InspectionMode = "exact" | "scaled-baseline" | "adaptive-layout";

export type InspectionBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type InspectionIssue = {
  id: string;
  type: InspectionIssueType;
  severity: InspectionSeverity;
  bbox: InspectionBox;
  changedPixelRatio: number;
  score: number;
  summary: string;
};

export type InspectionImageMeta = {
  fileName: string;
  width: number;
  height: number;
};

export type AdaptiveLayoutMeta = {
  strategy: "edge-fixed-stretch";
  sourceGutters: { left: number; right: number };
  targetGutters: { left: number; right: number };
  densityY: number;
  fullBleedRows: number;
};

export type InspectionResult = {
  schemaVersion: 1;
  engineVersion: "pixel-baseline-v1" | "pixel-adaptive-v1";
  createdAt: string;
  mode: InspectionMode;
  confidence: number;
  warnings: string[];
  ignoredTop: number;
  reference: InspectionImageMeta;
  implementation: InspectionImageMeta;
  totalChangedPixelRatio: number;
  issues: InspectionIssue[];
  adaptive?: AdaptiveLayoutMeta;
};

export type PixelBuffer = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
};

export type InspectPixelInput = {
  reference: PixelBuffer;
  implementation: PixelBuffer;
  referenceFileName?: string;
  implementationFileName?: string;
  threshold?: number;
  cellSize?: number;
  ignoreRegions?: InspectionBox[];
  createdAt?: string;
};
