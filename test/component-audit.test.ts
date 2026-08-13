import { describe, expect, it } from "vitest";
import {
  readDesignJson,
  readUiSnapshotJson,
} from "../src/adapters/json.js";
import { auditComponent } from "../src/component-audit.js";
import {
  loadComponentProfiles,
  resolveAuditProfile,
  resolveRuntimeAuditProfile,
} from "../src/component-specs.js";

describe("component profile audit", () => {
  it("loads the versioned secondary tab specification", async () => {
    const profiles = await loadComponentProfiles();
    const secondaryTab = profiles.find(
      (profile) => profile.id === "secondary-tab",
    );

    expect(secondaryTab).toMatchObject({
      version: "1.2.0",
      title: "二级 Tab",
      reference: {
        nodeId: "13468:186458",
      },
    });
    expect(secondaryTab?.rules.map((rule) => rule.id)).toEqual([
      "container.height",
      "item.width",
      "item.height",
      "item.horizontalPadding",
      "item.gap",
      "selected.textColor",
      "selected.backgroundColor",
      "unselected.textColor",
      "unselected.backgroundColor",
    ]);
  });

  it("recognizes a selected Lookin module from its iOS Kit identity", async () => {
    const detection = await resolveRuntimeAuditProfile("auto", {
      pageName: "TopTop",
      device: { width: 375, height: 812 },
      root: {
        id: "lookin-1",
        type: "TTSecondaryTabView",
        classChain: ["TTSecondaryTabView", "UIView"],
        accessibilityIdentifier: "audit.secondaryTab",
        frame: { x: 16, y: 120, width: 343, height: 48 },
        children: [],
      },
    });

    expect(detection).toMatchObject({
      profile: {
        id: "secondary-tab",
        reference: { nodeId: "13468:186458" },
      },
      confidence: 1,
      reason: "ios-accessibility-identifier",
    });
  });

  it("records and resolves the underline secondary tab by Figma source", async () => {
    const profiles = await loadComponentProfiles();
    const underlineTab = profiles.find(
      (profile) => profile.id === "secondary-tab-underline",
    );

    expect(underlineTab).toMatchObject({
      version: "1.1.0",
      title: "二级 Tab（下划线）",
      reference: {
        nodeId: "13468:186532",
      },
      detection: {
        figmaFileKeys: ["tyYEbtAXWTxSLduue3ixgp"],
        figmaComponentIds: ["13468:186532"],
      },
    });

    const design = await readDesignJson("samples/secondary-tab-figma.json");
    design.fileKey = "tyYEbtAXWTxSLduue3ixgp";
    design.root.id = "13468:186532";
    design.root.name = "Component 26";
    design.root.componentId = undefined;
    design.root.componentName = undefined;
    design.root.children = [];

    const detection = await resolveAuditProfile("auto", design);

    expect(detection).toMatchObject({
      profile: { id: "secondary-tab-underline" },
      confidence: 1,
      reason: "figma-component-id",
    });
  });

  it("records and resolves primary navigation by Figma component set", async () => {
    const profiles = await loadComponentProfiles();
    const primaryNavigation = profiles.find(
      (profile) => profile.id === "primary-navigation",
    );

    expect(primaryNavigation).toMatchObject({
      version: "1.0.0",
      title: "一级导航",
      status: "stable",
      reference: {
        nodeId: "753:6872",
      },
      detection: {
        figmaFileKeys: ["tyYEbtAXWTxSLduue3ixgp"],
        figmaComponentIds: ["743:6003"],
      },
    });

    const design = await readDesignJson("samples/secondary-tab-figma.json");
    design.fileKey = "tyYEbtAXWTxSLduue3ixgp";
    design.root.id = "743:6003";
    design.root.name = "导航栏";
    design.root.componentId = undefined;
    design.root.componentName = undefined;
    design.root.children = [];

    const detection = await resolveAuditProfile("auto", design);

    expect(detection).toMatchObject({
      profile: { id: "primary-navigation" },
      confidence: 1,
      reason: "figma-component-id",
    });
  });

  it("records and resolves buttons by Figma component ID", async () => {
    const profiles = await loadComponentProfiles();
    const button = profiles.find((profile) => profile.id === "button");

    expect(button).toMatchObject({
      version: "1.0.0",
      title: "按钮",
      status: "review",
      reference: {
        nodeId: "40:3514",
      },
      detection: {
        figmaFileKeys: ["tyYEbtAXWTxSLduue3ixgp"],
      },
    });

    const design = await readDesignJson("samples/secondary-tab-figma.json");
    design.fileKey = "tyYEbtAXWTxSLduue3ixgp";
    design.root.id = "40:3516";
    design.root.name = "全局按钮";
    design.root.componentId = undefined;
    design.root.componentName = undefined;
    design.root.children = [];

    const detection = await resolveAuditProfile("auto", design);

    expect(detection).toMatchObject({
      profile: { id: "button" },
      confidence: 1,
      reason: "figma-component-id",
    });
  });

  it("scopes exact Figma node IDs to their source file", async () => {
    const design = await readDesignJson("samples/secondary-tab-figma.json");
    design.fileKey = "another-file";
    design.root.id = "13468:186532";
    design.root.name = "Component 26";
    design.root.componentId = undefined;
    design.root.componentName = undefined;
    design.root.children = [];

    const detection = await resolveAuditProfile("auto", design);

    expect(detection.profile).toBeUndefined();
  });

  it("aggregates secondary tab problems by component rule", async () => {
    const design = await readDesignJson("samples/secondary-tab-figma.json");
    const actual = await readUiSnapshotJson(
      "samples/secondary-tab-lookin.json",
    );
    const detection = await resolveAuditProfile("auto", design);
    expect(detection.profile?.id).toBe("secondary-tab");

    const result = auditComponent(
      design,
      actual,
      actual.root.id,
      detection.profile!,
    );

    expect(result.recognition.structureConfirmed).toBe(true);
    expect(result.semanticMapping).toHaveLength(3);
    expect(result.issues.length).toBeLessThanOrEqual(
      detection.profile!.rules.length,
    );
    expect(new Set(result.issues.map((issue) => issue.ruleId)).size).toBe(
      result.issues.length,
    );
    expect(result.issues.map((issue) => issue.ruleId)).toEqual(
      expect.arrayContaining([
        "container.height",
        "item.width",
        "item.height",
        "item.horizontalPadding",
        "unselected.textColor",
      ]),
    );
    expect(
      result.issues.every(
        (issue) => !issue.description.includes("Frame "),
      ),
    ).toBe(true);
    expect(result.debugIssues.length).toBeGreaterThan(result.issues.length);
  });

  it("runs the shared tab audit for the underline variant", async () => {
    const profiles = await loadComponentProfiles();
    const profile = profiles.find(
      (candidate) => candidate.id === "secondary-tab-underline",
    )!;
    const design = await readDesignJson("samples/secondary-tab-figma.json");
    const actual = await readUiSnapshotJson(
      "samples/secondary-tab-lookin.json",
    );
    for (const [index, item] of (design.root.children ?? []).entries()) {
      item.componentProperties = undefined;
      item.backgroundColor = undefined;
      const label = item.children?.[0];
      if (label?.color) {
        label.color.a = index === 0 ? 1 : 0.3;
      }
    }

    const result = auditComponent(
      design,
      actual,
      actual.root.id,
      profile,
    );

    expect(result.profile.id).toBe("secondary-tab-underline");
    expect(result.recognition.structureConfirmed).toBe(true);
    expect(
      result.semanticModels.design.items.filter(
        (item) => item.state === "selected",
      ),
    ).toHaveLength(1);
    expect(result.issues.length).toBeLessThanOrEqual(profile.rules.length);
  });

  it("points bottom navigation kit reference at a single five-item variant", async () => {
    const profiles = await loadComponentProfiles();
    const bottomNav = profiles.find(
      (profile) => profile.id === "bottom-navigation",
    );

    expect(bottomNav?.reference).toMatchObject({
      nodeId: "209:13859",
    });
    expect(bottomNav?.reference?.figmaUrl).toContain("node-id=209-13859");
  });

  it("leaves unknown components on the generic audit path", async () => {
    const design = await readDesignJson("samples/secondary-tab-figma.json");
    design.root.name = "Business Card";
    design.root.componentName = undefined;
    design.root.componentId = undefined;
    design.root.children = [];

    const detection = await resolveAuditProfile("auto", design);

    expect(detection.profile).toBeUndefined();
    expect(detection.reason).toBe("no-confident-profile-match");
  });
});
