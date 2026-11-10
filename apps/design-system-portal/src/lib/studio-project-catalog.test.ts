import { describe, expect, it } from "vitest";
import {
  STUDIO_PROJECTS,
  getStudioProject,
  isStudioProjectId,
} from "./studio-project-catalog";

describe("studio project catalog", () => {
  it("contains unique routable projects with static covers", () => {
    expect(new Set(STUDIO_PROJECTS.map((project) => project.id)).size).toBe(
      STUDIO_PROJECTS.length,
    );
    for (const project of STUDIO_PROJECTS) {
      expect(isStudioProjectId(project.id)).toBe(true);
      expect(project.coverSrc).toMatch(/^\/prototypes\/studio\/.+\.png$/);
      expect(getStudioProject(project.id)).toEqual(project);
    }
  });

  it("rejects IDs outside the Studio deletion allowlist", () => {
    expect(isStudioProjectId("profile")).toBe(false);
    expect(isStudioProjectId("../../components/kit/button")).toBe(false);
  });
});
