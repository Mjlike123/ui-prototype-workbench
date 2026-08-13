import { describe, expect, it } from "vitest";
import { parsePageCanvasPrompt } from "./page-canvas-parser";

describe("parsePageCanvasPrompt", () => {
  it("builds a profile page from product intent", () => {
    const plan = parsePageCanvasPrompt("我想要一个个人 profile 页面");
    expect(plan.intent).toBe("profile");
    expect(plan.blocks.map((b) => b.kind)).toEqual([
      "regular-navigation",
      "secondary-tab",
      "regular-list",
      "bottom-navigation",
    ]);
    expect(plan.initialState?.bottomNavIndex).toBe(4);
  });

  it("builds a settings page from product intent", () => {
    const plan = parsePageCanvasPrompt(
      "设置页：返回 + 标题「账号与安全」，操作列表 5 行，底部主按钮「保存」",
    );
    expect(plan.title).toBe("账号与安全");
    expect(plan.intent).toBe("custom");
    expect(plan.blocks.map((b) => b.kind)).toEqual([
      "regular-navigation",
      "regular-list",
      "button-bar",
    ]);
    const button = plan.blocks.find((b) => b.kind === "button-bar");
    expect(button && button.kind === "button-bar" && button.primaryLabel).toBe(
      "保存",
    );
  });

  it("builds a home shell with primary nav, list, and bottom tabs", () => {
    const plan = parsePageCanvasPrompt(
      "首页：一级导航 Mine / Popular，底部 Tab，中间是消息列表",
    );
    expect(plan.blocks.map((b) => b.kind)).toEqual([
      "primary-navigation",
      "regular-list",
      "bottom-navigation",
    ]);
  });

  it("includes search and list for search flows", () => {
    const plan = parsePageCanvasPrompt("搜索页：返回 + 搜索框，下方好友列表");
    expect(plan.blocks.map((b) => b.kind)).toContain("search-control");
    expect(plan.blocks.map((b) => b.kind)).toContain("regular-list");
  });
});
