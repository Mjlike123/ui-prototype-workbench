import { describe, expect, it } from "vitest";
import {
  foundationNavItems,
  foundationNavTabs,
  getFoundationNavLabel,
  sortFoundationsByNavOrder,
} from "./foundation-nav";

describe("foundation-nav", () => {
  it("keeps sidebar tabs aligned with page quick nav order and labels", () => {
    expect(foundationNavTabs.map((tab) => tab.label)).toEqual(
      foundationNavItems.map((item) => item.label),
    );
    expect(foundationNavTabs.map((tab) => tab.href)).toEqual(
      foundationNavItems.map((item) => `/foundations#${item.id}`),
    );
  });

  it("sorts catalog foundations by the shared nav order", () => {
    const foundations = [
      { id: "typography" },
      { id: "radius" },
      { id: "semantic-colors" },
      { id: "responsive-layout" },
    ];

    expect(sortFoundationsByNavOrder(foundations).map((item) => item.id)).toEqual([
      "semantic-colors",
      "responsive-layout",
      "radius",
      "typography",
    ]);
  });

  it("uses the shared label for responsive layout", () => {
    expect(getFoundationNavLabel("responsive-layout")).toBe("宽屏适配");
  });
});
