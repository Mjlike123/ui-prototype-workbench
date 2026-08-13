import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { InspectionResult } from "@/lib/visual-inspection/types";
import {
  ComparisonViewer,
  VisualInspectionWorkbench,
} from "./visual-inspection-workbench";

describe("VisualInspectionWorkbench", () => {
  it("renders the complete local inspection workflow in its initial state", () => {
    render(<VisualInspectionWorkbench />);

    expect(screen.getByText("设计稿")).toBeInTheDocument();
    expect(screen.getByText("实现截图")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "开始走查" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "实现图标注" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "平铺对比" })).toBeDisabled();
    expect(screen.getByRole("tab", { name: "透明叠加" })).toBeDisabled();
    expect(screen.getByText("走查结果会显示在这里。")).toBeInTheDocument();
    expect(screen.getByText("还没有走查记录。")).toBeInTheDocument();
  });

  it("provides accessible issue filters and export actions", () => {
    render(<VisualInspectionWorkbench />);

    expect(screen.getByLabelText("严重度")).toBeInTheDocument();
    expect(screen.getByLabelText("类型")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "PNG 验收板" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Markdown" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "JSON" })).toBeDisabled();
  });

  it("keeps issue annotations in annotated, split, and overlay views", () => {
    const image = document.createElement("img");
    Object.defineProperties(image, {
      naturalWidth: { value: 100 },
      naturalHeight: { value: 200 },
    });
    const loaded = { fileName: "screen.png", url: "blob:screen", image };
    const result: InspectionResult = {
      schemaVersion: 1,
      engineVersion: "pixel-baseline-v1",
      createdAt: "2026-08-11T08:00:00.000Z",
      mode: "exact",
      confidence: 95,
      warnings: [],
      ignoredTop: 0,
      reference: { fileName: "design.png", width: 100, height: 200 },
      implementation: { fileName: "screen.png", width: 100, height: 200 },
      totalChangedPixelRatio: 0.1,
      issues: [
        {
          id: "issue-1",
          type: "位置",
          severity: "中等",
          bbox: { x: 10, y: 20, width: 30, height: 40 },
          changedPixelRatio: 0.5,
          score: 60,
          summary: "区域轮廓或位置与参考图不一致",
        },
      ],
    };
    const baseProps = {
      reference: { ...loaded, fileName: "design.png", url: "blob:design" },
      implementation: loaded,
      result,
      issues: result.issues,
      activeIssue: result.issues[0]!,
      opacity: 50,
      zoom: 100,
      onIssueSelect: () => undefined,
    };
    const { rerender } = render(
      <ComparisonViewer {...baseProps} viewMode="annotated" />,
    );
    expect(
      screen.getByRole("button", { name: /定位问题 1/ }),
    ).toBeInTheDocument();

    rerender(<ComparisonViewer {...baseProps} viewMode="split" />);
    expect(
      screen.getByRole("button", { name: /定位问题 1/ }),
    ).toBeInTheDocument();

    rerender(<ComparisonViewer {...baseProps} viewMode="overlay" />);
    expect(
      screen.getByRole("button", { name: /定位问题 1/ }),
    ).toBeInTheDocument();
  });
});
