import { describe, expect, it } from "vitest";
import {
  extractJsonFromAgentText,
  parsePageCanvasAgentVisionResult,
} from "./page-canvas-agent-vision";

const sample = {
  schemaVersion: 1,
  sourceImage: { width: 375, height: 812, fileName: "screen.png" },
  plan: {
    title: "个人资料",
    intent: "profile",
    blocks: [
      {
        kind: "regular-navigation",
        title: "个人资料",
        leading: "none",
        trailing: "icon",
      },
      {
        kind: "secondary-tab",
        variant: "pill",
        labels: ["动态", "资料", "相册"],
      },
      { kind: "regular-list", rows: 4, mode: "action" },
      { kind: "bottom-navigation" },
    ],
    matched: ["Cursor 视觉分析"],
    warnings: [],
    initialState: { bottomNavIndex: 4 },
  },
  yuebanLayers: [
    {
      id: "artboard-reference",
      type: "bitmap",
      source_bbox: { x: 0, y: 0, width: 375, height: 812 },
      z_index: 1,
    },
    {
      id: "layer-nav",
      type: "component",
      componentId: "regular-navigation",
      source_bbox: { x: 0, y: 44, width: 375, height: 44 },
      z_index: 2,
    },
  ],
};

describe("page-canvas-agent-vision", () => {
  it("parses agent JSON", () => {
    const result = parsePageCanvasAgentVisionResult(sample);
    expect(result.plan.blocks.length).toBe(4);
    expect(result.yuebanLayers[1]?.scaled_bbox.width).toBe(750);
  });

  it("extracts fenced json", () => {
    const raw = extractJsonFromAgentText(
      "说明\n```json\n" + JSON.stringify(sample) + "\n```",
    );
    const result = parsePageCanvasAgentVisionResult(raw);
    expect(result.plan.intent).toBe("profile");
  });
});
