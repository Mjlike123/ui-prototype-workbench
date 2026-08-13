import { describe, expect, it } from "vitest";
import { parsePageCanvasPrompt } from "./page-canvas-parser";
import {
  buildDesignMvpManifest,
  buildMonkrenReviewPrompt,
} from "./design-mvp-bundle";

describe("design-mvp-bundle", () => {
  it("builds manifest layers from profile plan", () => {
    const plan = parsePageCanvasPrompt("我想要一个个人 profile 页面");
    const manifest = buildDesignMvpManifest({
      prompt: "我想要一个个人 profile 页面",
      plan,
      viewportWidth: 375,
      viewportHeight: 812,
    });
    expect(manifest.schemaVersion).toBe(1);
    expect(manifest.layers.length).toBe(plan.blocks.length);
    expect(manifest.specHints.components).toContain(
      "specs/components/regular-navigation.yaml",
    );
  });

  it("builds monkren prompt with readonly and component list", () => {
    const plan = parsePageCanvasPrompt(
      "设置页：返回 + 标题「账号与安全」，操作列表 5 行，底部主按钮「保存」",
    );
    const manifest = buildDesignMvpManifest({
      prompt: "test",
      plan,
      viewportWidth: 375,
      viewportHeight: 812,
    });
    const prompt = buildMonkrenReviewPrompt({ manifest });
    expect(prompt).toContain("只读审查");
    expect(prompt).toContain("5-dim-review");
    expect(prompt).toContain("regular-navigation");
  });
});
