import { describe, expect, it } from "vitest";
import {
  IPHONE_DUO_INNER,
  IPHONE_DUO_INNER_PORTRAIT,
  IPHONE_DUO_OUTER,
  IPHONE_DUO_OUTER_CAMERA_INSET,
  iphoneDuoCanvasClass,
  iphoneDuoChromeAxis,
  iphoneDuoPaneWidth,
  iphoneDuoReservedInsets,
  isIphoneDuoInnerCanvas,
} from "./iphone-duo-layout";

describe("iphone-duo-layout", () => {
  it("treats Duo inner 890 as two-pane and keeps 375/466 single column", () => {
    expect(isIphoneDuoInnerCanvas(375)).toBe(false);
    expect(isIphoneDuoInnerCanvas(IPHONE_DUO_OUTER.width)).toBe(false);
    expect(isIphoneDuoInnerCanvas(IPHONE_DUO_INNER.width)).toBe(true);
    expect(iphoneDuoPaneWidth(375)).toBe(375);
    expect(iphoneDuoPaneWidth(890)).toBe(445);
    expect(iphoneDuoCanvasClass(890)).toContain("prototypePrimaryDuo--inner");
  });

  it("puts tab bars on the vertical edge for outer and inner landscape", () => {
    expect(iphoneDuoChromeAxis(375, 812)).toBe("horizontal");
    expect(
      iphoneDuoChromeAxis(IPHONE_DUO_OUTER.width, IPHONE_DUO_OUTER.height),
    ).toBe("vertical");
    expect(
      iphoneDuoChromeAxis(IPHONE_DUO_INNER.width, IPHONE_DUO_INNER.height),
    ).toBe("vertical");
    expect(
      iphoneDuoChromeAxis(
        IPHONE_DUO_INNER_PORTRAIT.width,
        IPHONE_DUO_INNER_PORTRAIT.height,
      ),
    ).toBe("horizontal");
  });

  it("keeps outer side tabs below the camera reserved region", () => {
    const outer = iphoneDuoReservedInsets(
      IPHONE_DUO_OUTER.width,
      IPHONE_DUO_OUTER.height,
    );
    expect(outer.top).toBe(IPHONE_DUO_OUTER_CAMERA_INSET);
    expect(outer.top).toBeGreaterThanOrEqual(44);
    expect(
      iphoneDuoReservedInsets(IPHONE_DUO_INNER.width, IPHONE_DUO_INNER.height)
        .top,
    ).toBe(0);
  });
});
