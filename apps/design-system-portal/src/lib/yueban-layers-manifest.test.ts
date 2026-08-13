import { describe, expect, it } from "vitest";
import { parsePageCanvasPrompt } from "./page-canvas-parser";
import {
  buildYuebanLayerList,
  computeYuebanScale,
  scaleBBox,
  YUEBAN_ARTBOARD_WIDTH,
} from "./yueban-layers-manifest";

describe("yueban-layers-manifest", () => {
  it("scales bbox to 750 artboard width", () => {
    const scale = computeYuebanScale(375);
    expect(scale).toBe(2);
    expect(scaleBBox({ x: 10, y: 20, width: 100, height: 40 }, scale)).toEqual({
      x: 20,
      y: 40,
      width: 200,
      height: 80,
    });
    expect(YUEBAN_ARTBOARD_WIDTH).toBe(750);
  });

  it("builds layer list from profile plan", () => {
    const plan = parsePageCanvasPrompt("我想要一个个人 profile 页面");
    const layers = buildYuebanLayerList({
      sourceWidth: 1125,
      sourceHeight: 2436,
      analysis: {
        hasTopNavigation: true,
        hasSecondaryTabs: true,
        hasBottomNavigation: true,
        hasSearchField: false,
        estimatedListRows: 6,
        hasButtonBar: false,
        confidence: 0.7,
        notes: [],
      },
      plan,
    });
    expect(layers.length).toBeGreaterThan(3);
    expect(layers[0]?.id).toBe("artboard-reference");
    expect(layers.some((layer) => layer.type === "component")).toBe(true);
    expect(layers.every((layer) => layer.scaled_bbox.width >= 0)).toBe(true);
  });
});
