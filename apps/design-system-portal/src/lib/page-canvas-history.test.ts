import { describe, expect, it } from "vitest";
import { parsePageCanvasPrompt } from "./page-canvas-parser";
import {
  appendPageCanvasHistoryEntry,
  buildHistoryEntry,
  isDuplicateOfLatest,
  loadPageCanvasHistory,
  parseHistoryEntries,
  removePageCanvasHistoryEntry,
} from "./page-canvas-history";

describe("page-canvas-history", () => {
  it("persists entries in memory storage", () => {
    const storage = new MemoryStorage();
    const plan = parsePageCanvasPrompt("我想要一个个人 profile 页面");
    const entry = buildHistoryEntry(
      {
        prompt: "我想要一个个人 profile 页面",
        plan,
        viewportWidth: 375,
        viewportHeight: 812,
        reference: null,
      },
      "manual",
    );
    appendPageCanvasHistoryEntry(entry, { storage });
    const loaded = loadPageCanvasHistory(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0]?.plan.intent).toBe("profile");
  });

  it("skips duplicate when requested", () => {
    const storage = new MemoryStorage();
    const plan = parsePageCanvasPrompt("设置页");
    const snapshot = {
      prompt: "设置页",
      plan,
      viewportWidth: 375,
      viewportHeight: 812,
      reference: null,
    };
    const first = buildHistoryEntry(snapshot, "auto");
    appendPageCanvasHistoryEntry(first, { storage });
    const second = buildHistoryEntry(snapshot, "auto");
    expect(isDuplicateOfLatest(second, first)).toBe(true);
    appendPageCanvasHistoryEntry(second, {
      storage,
      skipIfDuplicate: true,
    });
    expect(loadPageCanvasHistory(storage)).toHaveLength(1);
  });

  it("removes entry by id", () => {
    const storage = new MemoryStorage();
    const entry = buildHistoryEntry(
      {
        prompt: "test",
        plan: parsePageCanvasPrompt("搜索页：返回 + 搜索框，下方好友列表"),
        viewportWidth: 390,
        viewportHeight: 844,
        reference: null,
      },
      "manual",
    );
    appendPageCanvasHistoryEntry(entry, { storage });
    const next = removePageCanvasHistoryEntry(entry.id, storage);
    expect(next).toHaveLength(0);
  });

  it("rejects invalid stored rows", () => {
    expect(parseHistoryEntries([{ foo: 1 }])).toEqual([]);
  });
});

class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}
