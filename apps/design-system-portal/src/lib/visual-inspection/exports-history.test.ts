import { describe, expect, it } from "vitest";
import { inspectionJson, inspectionMarkdown } from "./exports";
import {
  appendInspectionHistory,
  createHistoryEntry,
  loadInspectionHistory,
  parseInspectionHistory,
  VISUAL_INSPECTION_HISTORY_KEY,
} from "./history";
import type { InspectionResult } from "./types";

const result: InspectionResult = {
  schemaVersion: 1,
  engineVersion: "pixel-baseline-v1",
  createdAt: "2026-08-11T03:00:00.000Z",
  mode: "exact",
  confidence: 95,
  warnings: ["仅用于辅助走查。"],
  ignoredTop: 0,
  reference: { fileName: "design.png", width: 390, height: 844 },
  implementation: { fileName: "actual.png", width: 390, height: 844 },
  totalChangedPixelRatio: 0.0125,
  issues: [
    {
      id: "issue-1",
      type: "颜色",
      severity: "严重",
      bbox: { x: 20, y: 100, width: 160, height: 48 },
      changedPixelRatio: 0.82,
      score: 86,
      summary: "区域颜色与参考图差异明显（变化像素 82%）",
    },
    {
      id: "issue-2",
      type: "位置",
      severity: "轻微",
      bbox: { x: 20, y: 180, width: 80, height: 24 },
      changedPixelRatio: 0.21,
      score: 32,
      summary: "区域轮廓或位置与参考图不一致（变化像素 21%）",
    },
  ],
};

describe("visual inspection exports", () => {
  it("serializes the canonical result as JSON", () => {
    expect(JSON.parse(inspectionJson(result))).toMatchObject({
      schemaVersion: 1,
      issues: [{ id: "issue-1" }, { id: "issue-2" }],
    });
  });

  it("builds a severity-grouped repair checklist", () => {
    const markdown = inspectionMarkdown(result);
    expect(markdown).toContain("## 严重（1）");
    expect(markdown).toContain("## 轻微（1）");
    expect(markdown).toContain("- [ ] issue-1 · 颜色");
    expect(markdown).toContain("不作为自动验收门禁");
  });
});

describe("visual inspection history", () => {
  it("stores result summaries without raw image data", () => {
    const entry = createHistoryEntry(result);
    expect(entry.issueCounts).toEqual({ 严重: 1, 中等: 0, 轻微: 1 });
    expect(JSON.stringify(entry)).not.toContain("data:image");
  });

  it("rejects malformed history values", () => {
    expect(parseInspectionHistory([{ schemaVersion: 2 }, null])).toEqual([]);
  });

  it("appends and reloads entries through storage", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };
    appendInspectionHistory(result, storage);
    expect(values.has(VISUAL_INSPECTION_HISTORY_KEY)).toBe(true);
    expect(loadInspectionHistory(storage)).toHaveLength(1);
    expect(loadInspectionHistory(storage)[0]?.result.issues).toHaveLength(2);
  });
});
