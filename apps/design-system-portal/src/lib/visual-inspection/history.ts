import type { InspectionResult, InspectionSeverity } from "./types";

export const VISUAL_INSPECTION_HISTORY_KEY = "toptop-visual-inspection-history-v1";
export const VISUAL_INSPECTION_HISTORY_LIMIT = 12;

export type VisualInspectionHistoryEntry = {
  schemaVersion: 1;
  id: string;
  createdAt: string;
  referenceFileName: string;
  implementationFileName: string;
  referenceSize: [number, number];
  implementationSize: [number, number];
  mode: InspectionResult["mode"];
  confidence: number;
  totalChangedPixelRatio: number;
  issueCounts: Record<InspectionSeverity, number>;
  result: InspectionResult;
};

export function createHistoryEntry(result: InspectionResult): VisualInspectionHistoryEntry {
  return {
    schemaVersion: 1,
    id: `visual-${Date.parse(result.createdAt) || Date.now()}`,
    createdAt: result.createdAt,
    referenceFileName: result.reference.fileName,
    implementationFileName: result.implementation.fileName,
    referenceSize: [result.reference.width, result.reference.height],
    implementationSize: [
      result.implementation.width,
      result.implementation.height,
    ],
    mode: result.mode,
    confidence: result.confidence,
    totalChangedPixelRatio: result.totalChangedPixelRatio,
    issueCounts: {
      严重: result.issues.filter((issue) => issue.severity === "严重").length,
      中等: result.issues.filter((issue) => issue.severity === "中等").length,
      轻微: result.issues.filter((issue) => issue.severity === "轻微").length,
    },
    result,
  };
}

export function parseInspectionHistory(raw: unknown): VisualInspectionHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isHistoryEntry).slice(0, VISUAL_INSPECTION_HISTORY_LIMIT);
}

export function loadInspectionHistory(
  storage: Pick<Storage, "getItem"> | null = browserStorage(),
) {
  if (!storage) return [];
  try {
    const raw = storage.getItem(VISUAL_INSPECTION_HISTORY_KEY);
    return raw ? parseInspectionHistory(JSON.parse(raw) as unknown) : [];
  } catch {
    return [];
  }
}

export function appendInspectionHistory(
  result: InspectionResult,
  storage: Pick<Storage, "getItem" | "setItem"> | null = browserStorage(),
) {
  const entry = createHistoryEntry(result);
  if (!storage) return [entry];
  const current = loadInspectionHistory(storage);
  const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(
    0,
    VISUAL_INSPECTION_HISTORY_LIMIT,
  );
  storage.setItem(VISUAL_INSPECTION_HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function clearInspectionHistory(
  storage: Pick<Storage, "removeItem"> | null = browserStorage(),
) {
  storage?.removeItem(VISUAL_INSPECTION_HISTORY_KEY);
}

function isHistoryEntry(value: unknown): value is VisualInspectionHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<VisualInspectionHistoryEntry>;
  return (
    entry.schemaVersion === 1 &&
    typeof entry.id === "string" &&
    typeof entry.createdAt === "string" &&
    typeof entry.referenceFileName === "string" &&
    typeof entry.implementationFileName === "string" &&
    Array.isArray(entry.referenceSize) &&
    Array.isArray(entry.implementationSize) &&
    (entry.mode === "exact" ||
      entry.mode === "scaled-baseline" ||
      entry.mode === "adaptive-layout") &&
    typeof entry.confidence === "number" &&
    typeof entry.totalChangedPixelRatio === "number" &&
    Boolean(entry.result && Array.isArray(entry.result.issues))
  );
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
