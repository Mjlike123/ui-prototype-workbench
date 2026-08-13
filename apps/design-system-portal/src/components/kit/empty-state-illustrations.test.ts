import { describe, expect, it } from "vitest";
import {
  EMPTY_STATE_ILLUSTRATIONS,
  resolveEmptyStateIllustrationSrc,
} from "./empty-state-illustrations";

describe("empty-state illustrations", () => {
  it("maps business illustration keys to kit asset paths", () => {
    expect(Object.keys(EMPTY_STATE_ILLUSTRATIONS)).toHaveLength(13);
    expect(resolveEmptyStateIllustrationSrc("no-gift")).toContain("no-gift.png");
    expect(resolveEmptyStateIllustrationSrc(undefined)).toContain("no-list.png");
  });
});
