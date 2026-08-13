import { describe, expect, it } from "vitest";
import {
  buildProfilePrototypeManifest,
  PROFILE_COMPONENT_MAPPING,
  PROFILE_PENDING_COMPONENTS,
  PROFILE_SECONDARY_TABS,
} from "./profile-prototype-model";

describe("profile-prototype-model", () => {
  it("keeps profile-specific identity UI out of the kit stack", () => {
    const ids = PROFILE_COMPONENT_MAPPING.layers.map(
      (layer) => layer.componentId,
    );
    expect(ids).not.toContain("profile-header");
    expect(ids).not.toContain("profile-media-grid");
    expect(ids).toContain("secondary-tab-underline");
    expect(PROFILE_COMPONENT_MAPPING.prototypeModules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "ProfileV3Identity" }),
        expect.objectContaining({ id: "PrototypeRoomEntry" }),
        expect.objectContaining({ id: "ProfileV3About" }),
        expect.objectContaining({ id: "ProfileV3Movement" }),
      ]),
    );
    expect(PROFILE_PENDING_COMPONENTS).toHaveLength(0);
    expect(PROFILE_SECONDARY_TABS.map((tab) => tab.label)).toEqual([
      "作品",
      "相册",
      "喜欢",
    ]);
  });

  it("builds design mvp manifest for profile prompt", () => {
    const manifest = buildProfilePrototypeManifest();
    expect(manifest.plan.intent).toBe("profile");
    expect(manifest.viewport).toEqual({ width: 375, height: 812 });
    expect(manifest.route).toBe("/prototypes/profile");
    expect(manifest.pendingComponents).toHaveLength(0);
  });
});
