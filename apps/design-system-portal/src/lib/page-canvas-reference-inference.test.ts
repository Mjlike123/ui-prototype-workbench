import { describe, expect, it } from "vitest";
import {
  analyzeReferenceLayout,
  buildPlanFromReferenceAnalysis,
} from "./page-canvas-reference-inference";

function makeImageData(
  width: number,
  height: number,
  paint: (x: number, y: number, data: Uint8ClampedArray, i: number) => void,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      paint(x, y, data, i);
    }
  }
  return { width, height, data, colorSpace: "srgb" } as ImageData;
}

describe("page-canvas-reference-inference", () => {
  it("detects bottom navigation band on synthetic layout", () => {
    const width = 375;
    const height = 812;
    const data = makeImageData(width, height, (x, y, px, i) => {
      px[i] = 245;
      px[i + 1] = 245;
      px[i + 2] = 247;
      px[i + 3] = 255;
      if (y < 60) {
        px[i] = 255;
        px[i + 1] = 255;
        px[i + 2] = 255;
      }
      if (y > height * 0.89) {
        px[i] = 30;
        px[i + 1] = 32;
        px[i + 2] = 38;
      }
      if (y > 120 && y < 500 && y % 56 < 1) {
        px[i] = 200;
        px[i + 1] = 200;
        px[i + 2] = 205;
      }
    });
    const analysis = analyzeReferenceLayout(data);
    expect(analysis.hasBottomNavigation).toBe(true);
    expect(analysis.estimatedListRows).toBeGreaterThanOrEqual(2);
  });

  it("builds component stack from analysis", () => {
    const plan = buildPlanFromReferenceAnalysis({
      analysis: {
        hasTopNavigation: true,
        hasSecondaryTabs: true,
        hasBottomNavigation: true,
        hasSearchField: false,
        estimatedListRows: 5,
        hasButtonBar: false,
        confidence: 0.7,
        notes: [],
      },
      title: "个人资料",
    });
    expect(plan.blocks.some((b) => b.componentId === "regular-navigation")).toBe(
      true,
    );
    expect(plan.blocks.some((b) => b.componentId === "secondary-tab")).toBe(true);
    expect(plan.blocks.some((b) => b.componentId === "bottom-navigation")).toBe(
      true,
    );
    expect(plan.intent).toBe("profile");
  });

  it("merges profile intent when hint prompt matches template", () => {
    const analysis = analyzeReferenceLayout(
      makeImageData(375, 812, (x, y, px, i) => {
        px[i] = 240;
        px[i + 1] = 240;
        px[i + 2] = 242;
        px[i + 3] = 255;
      }),
    );
    const plan = buildPlanFromReferenceAnalysis({
      analysis,
      hintPrompt: "我想要一个个人 profile 页面",
    });
    expect(plan.intent).toBe("profile");
    expect(plan.blocks.length).toBeGreaterThan(2);
  });
});
