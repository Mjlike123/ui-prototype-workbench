import { describe, expect, it } from "vitest";
import {
  getPrototypePreviewBreadcrumb,
  prototypePreviewNavTabs,
} from "./prototype-preview-nav";

describe("prototypePreviewNav", () => {
  it("lists core and studio destinations", () => {
    expect(prototypePreviewNavTabs.map((tab) => tab.label)).toEqual([
      "核心模块",
      "原型创作",
    ]);
  });

  it("builds breadcrumb with prototype preview root", () => {
    expect(getPrototypePreviewBreadcrumb("核心模块")).toEqual([
      { label: "原型预览", href: "/canvas/core" },
      { label: "核心模块" },
    ]);
  });
});
