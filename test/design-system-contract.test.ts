import { describe, expect, it } from "vitest";
import { loadPortalCatalog } from "@toptop/design-system-contract";
import { validateDesignSystem } from "@toptop/design-system-contract/validate";

describe("design system contract", () => {
  it("loads principles, foundations, components, interactions, mappings and audit rules", async () => {
    const catalog = await loadPortalCatalog();

    expect(catalog.components.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "button",
        "bottom-navigation",
        "chat-bubble",
        "chat-input",
        "regular-navigation",
        "secondary-tab",
        "secondary-tab-underline",
      ]),
    );
    expect(catalog.foundations.length).toBeGreaterThanOrEqual(4);
    expect(catalog.principles[0]?.principles.map((item) => item.id)).toEqual([
      "clarity",
      "consistency",
      "openness",
    ]);
    expect(catalog.interactions).toHaveLength(10);
    expect(catalog.interactions.map((item) => item.id)).toContain(
      "tab-selection",
    );
    expect(catalog.interactions.map((item) => item.id)).toContain(
      "bottom-sheet-behavior",
    );
    expect(catalog.interactions.map((item) => item.id)).toContain(
      "chat-input-compose",
    );
    expect(catalog.interactions.map((item) => item.id)).toContain(
      "chat-bubble-feedback",
    );
    expect(catalog.platformMappings.length).toBeGreaterThanOrEqual(6);
    expect(catalog.auditRegistries[0]?.rules.length).toBeGreaterThan(5);
  });

  it("validates every versioned specification against JSON Schema", async () => {
    const result = await validateDesignSystem();

    expect(result.errors).toEqual([]);
    expect(result.checkedFiles).toBeGreaterThanOrEqual(10);
    expect(result.valid).toBe(true);
  });

  it("loads TOP UI kit colors with light and dark modes", async () => {
    const catalog = await loadPortalCatalog();
    const colors = catalog.foundations.find(
      (item) => item.id === "semantic-colors",
    );

    expect(colors?.tokens).toHaveLength(48);
    expect(
      colors?.tokens.every(
        (token) => token.modes?.light && token.modes?.dark,
      ),
    ).toBe(true);
  });

  it("keeps wide-screen adaptation strategies and dialog bounds", async () => {
    const catalog = await loadPortalCatalog();
    const layout = catalog.foundations.find(
      (item) => item.id === "responsive-layout",
    );

    expect(layout?.category).toBe("grid");
    expect(layout?.tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "layout.adaptation.fixed",
          value: "fixed-size",
        }),
        expect.objectContaining({
          id: "layout.adaptation.stretch",
          value: "stretch-range",
        }),
        expect.objectContaining({
          id: "layout.adaptation.scale",
          value: "proportional-scale",
        }),
        expect.objectContaining({
          id: "layout.dialog.max-height",
          value: "70vh",
        }),
      ]),
    );
  });

  it("keeps portal metadata on executable component profiles", async () => {
    const catalog = await loadPortalCatalog();
    const underline = catalog.components.find(
      (item) => item.id === "secondary-tab-underline",
    );

    expect(underline).toMatchObject({
      status: "stable",
      previewKey: "secondary-tab-underline",
      interactionIds: ["tab-selection"],
      platformMappingIds: ["secondary-tab-underline-mapping"],
    });
    expect(underline?.rules.length).toBeGreaterThan(0);
  });

  it("keeps regular navigation title constraints from Figma", async () => {
    const catalog = await loadPortalCatalog();
    const navigation = catalog.components.find(
      (item) => item.id === "regular-navigation",
    );

    expect(navigation).toMatchObject({
      previewKey: "regular-navigation",
      interactionIds: ["regular-navigation-actions"],
      platformMappingIds: ["regular-navigation-mapping"],
    });
    expect(navigation?.reference?.observations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("超过两行后省略"),
        expect.stringContaining("最大宽 130pt"),
      ]),
    );
  });

  it("keeps bottom navigation themes and Room behavior from Figma", async () => {
    const catalog = await loadPortalCatalog();
    const navigation = catalog.components.find(
      (item) => item.id === "bottom-navigation",
    );

    expect(navigation).toMatchObject({
      previewKey: "bottom-navigation",
      interactionIds: ["bottom-navigation-selection"],
      platformMappingIds: ["bottom-navigation-mapping"],
    });
    expect(navigation?.reference?.observations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("高度均为 86pt"),
        expect.stringContaining("Room 始终使用默认图标"),
      ]),
    );
  });

  it("keeps button sizing and responsive layout rules from Figma", async () => {
    const catalog = await loadPortalCatalog();
    const button = catalog.components.find((item) => item.id === "button");

    expect(button).toMatchObject({
      previewKey: "button",
      interactionIds: ["button-press"],
      platformMappingIds: ["button-mapping"],
    });
    expect(button?.reference?.observations).toEqual(
      expect.arrayContaining([
        expect.stringContaining("48、40、32、24"),
        expect.stringContaining("左右边距各 16px"),
        expect.stringContaining("每种视觉类型必须提供默认、禁用、按下"),
      ]),
    );
  });

  it("keeps bottom sheet dismissal and nesting safeguards", async () => {
    const catalog = await loadPortalCatalog();
    const interaction = catalog.interactions.find(
      (item) => item.id === "bottom-sheet-behavior",
    );

    expect(interaction).toMatchObject({
      status: "stable",
      states: expect.arrayContaining([
        "open-root",
        "open-nested",
        "open-dirty",
        "dismiss-confirmation",
      ]),
    });
    expect(interaction?.edgeCases).toEqual(
      expect.arrayContaining([
        expect.stringContaining("最多三层"),
        expect.stringContaining("点击蒙层始终只返回一层"),
        expect.stringContaining("未保存的重要内容"),
      ]),
    );
  });
});
