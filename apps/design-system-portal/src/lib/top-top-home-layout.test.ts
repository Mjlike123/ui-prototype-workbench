import { describe, expect, it } from "vitest";
import {
  getMessageOnlineFriendStripLayout,
  getTopTopFriendStripLayout,
} from "./top-top-home-layout";

describe("getTopTopFriendStripLayout", () => {
  it("keeps four friends plus 7 More at the 375 baseline", () => {
    const layout = getTopTopFriendStripLayout(375);
    expect(layout.columns).toBe(5);
    expect(layout.visibleFriendCount).toBe(4);
    expect(layout.gap).toBeCloseTo(15.75, 2);
  });

  it("adds another friend slot on wide phones", () => {
    const layout = getTopTopFriendStripLayout(430);
    expect(layout.columns).toBe(6);
    expect(layout.visibleFriendCount).toBe(5);
    expect(layout.gap).toBeGreaterThanOrEqual(8);
    expect(layout.gap).toBeLessThanOrEqual(16);
  });

  it("keeps message online strip baseline and expands on wide phones", () => {
    const baseline = getMessageOnlineFriendStripLayout(375);
    expect(baseline.columns).toBe(5);
    expect(baseline.visibleFriendCount).toBe(4);
    expect(baseline.gap).toBeCloseTo(3.75, 2);

    const wide = getMessageOnlineFriendStripLayout(430);
    expect(wide.columns).toBe(6);
    expect(wide.visibleFriendCount).toBe(5);
    expect(wide.gap).toBe(0);
  });
});
