import { describe, expect, it } from "vitest";
import { readDesignJson, readUiSnapshotJson } from "../src/adapters/json.js";
import { auditPage, auditScope } from "../src/diff.js";
import { renderCsv } from "../src/report.js";

describe("ui audit", () => {
  it("detects fidelity issues between design and runtime UI", async () => {
    const design = await readDesignJson("samples/figma-page.json");
    const actual = await readUiSnapshotJson("samples/lookin-page.json");

    const result = auditPage(design, actual);

    expect(result.matches.length).toBeGreaterThanOrEqual(4);
    expect(result.issues.map((issue) => issue.type)).toContain("size");
    expect(result.issues.map((issue) => issue.type)).toContain("alignment");
    expect(result.issues.map((issue) => issue.type)).toContain("spacing");
    expect(result.issues.map((issue) => issue.type)).toContain("text");
    expect(result.issues.map((issue) => issue.type)).toContain("color");
    expect(result.issues[0]?.id).toBe("UI-001");
  });

  it("renders a lark-friendly csv", () => {
    const csv = renderCsv(
      [
        {
          id: "UI-001",
          pageName: "TopTop Detail",
          type: "spacing",
          severity: "medium",
          status: "confirmed",
          confidence: 0.92,
          description: "间距不一致",
          suggestion: "间距增加 10pt",
          designValue: "24pt",
          actualValue: "14pt",
          delta: "-10pt",
        },
      ],
      ["out/UI-001.svg"],
    );

    expect(csv).toContain("页面,问题编号,问题截图");
    expect(csv).toContain("间距增加 10pt");
    expect(csv).toContain("UI-001.svg");
  });

  it("audits only a selected runtime container", async () => {
    const design = await readDesignJson("samples/figma-page.json");
    const actual = await readUiSnapshotJson("samples/lookin-page.json");

    const result = auditScope(design, actual, "back");

    expect(result.scope.actualNode.id).toBe("back");
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.every((issue) => issue.actualNode?.id === "back" || !issue.actualNode)).toBe(true);
  });
});
