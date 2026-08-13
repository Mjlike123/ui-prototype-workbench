import { describe, expect, it } from "vitest";
import {
  inferEdgeGutters,
  remapAdaptiveLayout,
  shouldUseAdaptiveLayout,
} from "./adaptive-remap";
import { inspectPixelBuffers } from "./pixel-engine";
import type { PixelBuffer } from "./types";

function image(
  width: number,
  height: number,
  color: [number, number, number] = [245, 245, 247],
): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let offset = 0; offset < data.length; offset += 4) {
    data[offset] = color[0];
    data[offset + 1] = color[1];
    data[offset + 2] = color[2];
    data[offset + 3] = 255;
  }
  return { width, height, data };
}

function paint(
  target: PixelBuffer,
  box: { x: number; y: number; width: number; height: number },
  color: [number, number, number],
) {
  for (let y = box.y; y < box.y + box.height; y += 1) {
    for (let x = box.x; x < box.x + box.width; x += 1) {
      if (x < 0 || y < 0 || x >= target.width || y >= target.height) continue;
      const offset = (y * target.width + x) * 4;
      target.data[offset] = color[0];
      target.data[offset + 1] = color[1];
      target.data[offset + 2] = color[2];
    }
  }
}

function sample(
  buffer: PixelBuffer,
  x: number,
  y: number,
): [number, number, number] {
  const offset = (y * buffer.width + x) * 4;
  return [
    buffer.data[offset]!,
    buffer.data[offset + 1]!,
    buffer.data[offset + 2]!,
  ];
}

describe("adaptive widescreen remap", () => {
  it("keeps left-edge icons fixed while stretching center content", () => {
    // Narrow design: left icon + center bar + right icon
    const reference = image(100, 80);
    paint(reference, { x: 8, y: 24, width: 16, height: 16 }, [20, 20, 20]);
    paint(reference, { x: 28, y: 28, width: 44, height: 8 }, [30, 140, 130]);
    paint(reference, { x: 76, y: 24, width: 16, height: 16 }, [20, 20, 20]);

    // Wide impl: same fixed icons at edges, stretched center bar
    const implementation = image(140, 80);
    paint(implementation, { x: 8, y: 24, width: 16, height: 16 }, [20, 20, 20]);
    paint(implementation, { x: 28, y: 28, width: 84, height: 8 }, [30, 140, 130]);
    paint(implementation, { x: 116, y: 24, width: 16, height: 16 }, [20, 20, 20]);

    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.mode).toBe("adaptive-layout");
    expect(result.engineVersion).toBe("pixel-adaptive-v1");
    expect(result.confidence).toBeGreaterThanOrEqual(60);
    expect(result.totalChangedPixelRatio).toBeLessThan(0.02);
    expect(result.issues.length).toBeLessThanOrEqual(1);
  });

  it("still flags a fixed left control that drifted on wide layout", () => {
    const reference = image(100, 80);
    paint(reference, { x: 8, y: 24, width: 16, height: 16 }, [20, 20, 20]);
    paint(reference, { x: 28, y: 28, width: 44, height: 8 }, [30, 140, 130]);

    const implementation = image(140, 80);
    // Left icon wrongly shifted inward with the stretch.
    paint(implementation, { x: 28, y: 24, width: 16, height: 16 }, [20, 20, 20]);
    paint(implementation, { x: 48, y: 28, width: 64, height: 8 }, [30, 140, 130]);

    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.mode).toBe("adaptive-layout");
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.totalChangedPixelRatio).toBeGreaterThan(0.01);
  });

  it("uses scaled baseline for uniform whole-frame zoom", () => {
    const reference = image(100, 80);
    paint(reference, { x: 20, y: 20, width: 40, height: 20 }, [10, 10, 10]);
    const result = inspectPixelBuffers({
      reference,
      implementation: image(125, 100),
    });
    expect(result.mode).toBe("scaled-baseline");
    expect(shouldUseAdaptiveLayout(reference, image(125, 100))).toBe(false);
  });

  it("infers edge gutters from content insets", () => {
    const buffer = image(120, 60);
    paint(buffer, { x: 16, y: 10, width: 88, height: 40 }, [40, 40, 40]);
    const gutters = inferEdgeGutters(buffer);
    expect(gutters.left).toBeGreaterThanOrEqual(12);
    expect(gutters.right).toBeGreaterThanOrEqual(12);
  });

  it("remaps center pixels farther apart on a wider canvas", () => {
    const source = image(100, 40);
    paint(source, { x: 40, y: 10, width: 20, height: 20 }, [200, 40, 40]);
    const { buffer, meta } = remapAdaptiveLayout(source, 140, 40);
    expect(meta.strategy).toBe("edge-fixed-stretch");
    // Center mark should land near the middle of the wider frame.
    const mid = sample(buffer, 70, 20);
    expect(mid[0]).toBeGreaterThan(150);
  });
});

describe("pixel baseline inspection", () => {
  it("returns no issues for identical images", () => {
    const reference = image(80, 64, [255, 255, 255]);
    const result = inspectPixelBuffers({
      reference,
      implementation: image(80, 64, [255, 255, 255]),
      createdAt: "2026-08-11T00:00:00.000Z",
    });
    expect(result.mode).toBe("exact");
    expect(result.issues).toEqual([]);
    expect(result.totalChangedPixelRatio).toBe(0);
  });

  it("localizes a color change", () => {
    const reference = image(96, 72, [255, 255, 255]);
    const implementation = image(96, 72, [255, 255, 255]);
    paint(reference, { x: 16, y: 16, width: 40, height: 24 }, [20, 20, 20]);
    paint(implementation, { x: 16, y: 16, width: 40, height: 24 }, [210, 40, 50]);
    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.type).toBe("颜色");
    expect(result.issues[0]?.bbox).toMatchObject({ x: 16, y: 16 });
  });

  it("detects a moved visible region", () => {
    const reference = image(120, 80, [255, 255, 255]);
    const implementation = image(120, 80, [255, 255, 255]);
    paint(reference, { x: 24, y: 24, width: 40, height: 24 }, [10, 10, 10]);
    paint(implementation, { x: 32, y: 24, width: 40, height: 24 }, [10, 10, 10]);
    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.totalChangedPixelRatio).toBeGreaterThan(0);
  });

  it("ignores low-amplitude compression noise", () => {
    const reference = image(80, 64, [180, 180, 180]);
    const implementation = image(80, 64, [187, 174, 184]);
    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.issues).toEqual([]);
  });

  it("ignores changes confined to an inferred mobile status bar", () => {
    const reference = image(120, 240, [255, 255, 255]);
    const implementation = image(120, 240, [255, 255, 255]);
    paint(reference, { x: 0, y: 0, width: 120, height: 12 }, [20, 20, 20]);
    paint(implementation, { x: 0, y: 0, width: 120, height: 12 }, [220, 30, 30]);
    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.ignoredTop).toBeGreaterThanOrEqual(12);
    expect(result.issues).toEqual([]);
  });

  it("merges neighboring hot cells into one issue", () => {
    const reference = image(96, 64, [255, 255, 255]);
    const implementation = image(96, 64, [255, 255, 255]);
    paint(reference, { x: 16, y: 16, width: 16, height: 16 }, [0, 0, 0]);
    paint(reference, { x: 32, y: 16, width: 16, height: 16 }, [0, 0, 0]);
    const result = inspectPixelBuffers({ reference, implementation });
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]?.bbox.width).toBe(32);
  });

  it("marks uniform zoom as a low-confidence scaled baseline", () => {
    const result = inspectPixelBuffers({
      reference: image(100, 80, [255, 255, 255]),
      implementation: image(125, 100, [255, 255, 255]),
    });
    expect(result.mode).toBe("scaled-baseline");
    expect(result.confidence).toBeLessThan(50);
    expect(result.warnings[0]).toContain("等比缩放");
  });
});
