import { describe, expect, it } from "vitest";
import {
  clampPageCanvasDimension,
  findMatchingPresetId,
  getPageCanvasPreset,
} from "./page-canvas-size";

describe("page-canvas-size", () => {
  it("clamps width and height into allowed ranges", () => {
    expect(clampPageCanvasDimension(300, "width")).toBe(320);
    expect(clampPageCanvasDimension(500, "width")).toBe(480);
    expect(clampPageCanvasDimension(400, "height")).toBe(480);
  });

  it("resolves default preset", () => {
    expect(getPageCanvasPreset("375")?.width).toBe(375);
    expect(findMatchingPresetId(375, 812)).toBe("375");
    expect(findMatchingPresetId(400, 812)).toBe("custom");
  });
});
