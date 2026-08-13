import type { PageCanvasPlan } from "./page-canvas-parser";

export const PAGE_CANVAS_HISTORY_STORAGE_KEY = "toptop-page-canvas-history-v1";
export const PAGE_CANVAS_HISTORY_MAX_ENTRIES = 40;

export type PageCanvasHistoryReference = {
  fileName: string;
  /** 仅在小体积时持久化，避免撑爆 localStorage */
  dataUrl?: string;
};

export type PageCanvasHistoryEntry = {
  schemaVersion: 1;
  id: string;
  savedAt: string;
  prompt: string;
  plan: PageCanvasPlan;
  viewport: { width: number; height: number };
  reference?: PageCanvasHistoryReference;
  source: "manual" | "auto";
};

export type PageCanvasHistorySnapshot = {
  prompt: string;
  plan: PageCanvasPlan;
  viewportWidth: number;
  viewportHeight: number;
  reference: PageCanvasHistoryReference | null;
};

const MAX_REFERENCE_DATA_URL_CHARS = 120_000;

export function createHistoryEntryId() {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function referenceForHistory(
  reference: PageCanvasHistoryReference | null,
): PageCanvasHistoryReference | undefined {
  if (!reference) return undefined;
  if (
    reference.dataUrl &&
    reference.dataUrl.length <= MAX_REFERENCE_DATA_URL_CHARS
  ) {
    return {
      fileName: reference.fileName,
      dataUrl: reference.dataUrl,
    };
  }
  return { fileName: reference.fileName };
}

export function buildHistoryEntry(
  snapshot: PageCanvasHistorySnapshot,
  source: PageCanvasHistoryEntry["source"],
): PageCanvasHistoryEntry {
  return {
    schemaVersion: 1,
    id: createHistoryEntryId(),
    savedAt: new Date().toISOString(),
    prompt: snapshot.prompt.trim(),
    plan: snapshot.plan,
    viewport: {
      width: snapshot.viewportWidth,
      height: snapshot.viewportHeight,
    },
    reference: referenceForHistory(snapshot.reference),
    source,
  };
}

export function historyEntryFingerprint(entry: PageCanvasHistoryEntry) {
  return JSON.stringify({
    prompt: entry.prompt,
    plan: entry.plan,
    viewport: entry.viewport,
    referenceFile: entry.reference?.fileName ?? null,
  });
}

export function isDuplicateOfLatest(
  entry: PageCanvasHistoryEntry,
  latest: PageCanvasHistoryEntry | undefined,
) {
  if (!latest) return false;
  return historyEntryFingerprint(entry) === historyEntryFingerprint(latest);
}

export function parseHistoryEntries(raw: unknown): PageCanvasHistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidHistoryEntry);
}

function isValidHistoryEntry(value: unknown): value is PageCanvasHistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<PageCanvasHistoryEntry>;
  return (
    entry.schemaVersion === 1 &&
    typeof entry.id === "string" &&
    typeof entry.savedAt === "string" &&
    typeof entry.prompt === "string" &&
    entry.plan !== undefined &&
    typeof entry.plan?.title === "string" &&
    typeof entry.plan?.intent === "string" &&
    Array.isArray(entry.plan?.blocks) &&
    entry.viewport !== undefined &&
    typeof entry.viewport?.width === "number" &&
    typeof entry.viewport?.height === "number"
  );
}

export function loadPageCanvasHistory(
  storage: Pick<Storage, "getItem"> | null = getBrowserStorage(),
): PageCanvasHistoryEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(PAGE_CANVAS_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return parseHistoryEntries(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function savePageCanvasHistory(
  entries: PageCanvasHistoryEntry[],
  storage: Pick<Storage, "setItem"> | null = getBrowserStorage(),
) {
  if (!storage) return;
  const trimmed = entries.slice(0, PAGE_CANVAS_HISTORY_MAX_ENTRIES);
  storage.setItem(PAGE_CANVAS_HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
}

export function appendPageCanvasHistoryEntry(
  entry: PageCanvasHistoryEntry,
  options?: {
    skipIfDuplicate?: boolean;
    storage?: Pick<Storage, "getItem" | "setItem">;
  },
): PageCanvasHistoryEntry[] {
  const storage = options?.storage ?? getBrowserStorage();
  if (!storage) return [entry];
  const current = loadPageCanvasHistory(storage);
  if (options?.skipIfDuplicate && isDuplicateOfLatest(entry, current[0])) {
    return current;
  }
  const next = [entry, ...current].slice(0, PAGE_CANVAS_HISTORY_MAX_ENTRIES);
  savePageCanvasHistory(next, storage);
  return next;
}

export function removePageCanvasHistoryEntry(
  id: string,
  storage: Pick<Storage, "getItem" | "setItem"> | null = getBrowserStorage(),
): PageCanvasHistoryEntry[] {
  if (!storage) return [];
  const next = loadPageCanvasHistory(storage).filter((item) => item.id !== id);
  savePageCanvasHistory(next, storage);
  return next;
}

export function clearPageCanvasHistory(
  storage: Pick<Storage, "removeItem"> | null = getBrowserStorage(),
) {
  storage?.removeItem(PAGE_CANVAS_HISTORY_STORAGE_KEY);
}

export function formatHistorySavedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
