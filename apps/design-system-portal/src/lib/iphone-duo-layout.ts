/** iPhone Duo 逻辑画布（官方像素 @3x）。 */
export const IPHONE_DUO_OUTER = { width: 466, height: 678 } as const;
export const IPHONE_DUO_INNER = { width: 890, height: 626 } as const;
export const IPHONE_DUO_INNER_PORTRAIT = { width: 626, height: 890 } as const;

/** 展开内屏横持的宽度门槛；800 覆盖 890 预设，避免误伤 430 Max。 */
export const IPHONE_DUO_INNER_MIN_WIDTH = 800;

export type IphoneDuoChromeAxis = "horizontal" | "vertical";

/** 外屏前摄 / 灵动岛在侧栏顶部，始终占用。 */
export const IPHONE_DUO_OUTER_CAMERA_INSET = 54;
/** Home Indicator 底部手势区。 */
export const IPHONE_DUO_HOME_INDICATOR_INSET = 21;

export function isIphoneDuoInnerCanvas(width: number) {
  return width >= IPHONE_DUO_INNER_MIN_WIDTH;
}

/**
 * HIG Vertical controls：外屏、内屏横持把 Tab/工具栏放到侧边；
 * 内屏竖持才保持常规底栏。不要按机型名分支。
 */
export function iphoneDuoChromeAxis(
  width: number,
  height: number,
): IphoneDuoChromeAxis {
  if (isIphoneDuoInnerCanvas(width)) {
    return width > height ? "vertical" : "horizontal";
  }
  if (
    height > width &&
    width >= 600 &&
    width < IPHONE_DUO_INNER_MIN_WIDTH &&
    height >= 800
  ) {
    return "horizontal";
  }
  const aspect = height / Math.max(width, 1);
  if (width >= IPHONE_DUO_OUTER.width - 8 && aspect <= 1.6) {
    return "vertical";
  }
  return "horizontal";
}

export function iphoneDuoContentShellClass(width: number, height: number) {
  return iphoneDuoChromeAxis(width, height) === "vertical"
    ? "pageCanvasContentShell pageCanvasContentShell--sideChrome"
    : "pageCanvasContentShell";
}

export function bottomNavigationAxisClass(axis: IphoneDuoChromeAxis) {
  return axis === "vertical" ? " bottomNavigation--vertical" : "";
}

export function iphoneDuoReservedInsets(width: number, height: number) {
  if (iphoneDuoChromeAxis(width, height) !== "vertical") {
    return { top: 0, bottom: 0 };
  }
  if (isIphoneDuoInnerCanvas(width)) {
    return { top: 0, bottom: IPHONE_DUO_HOME_INDICATOR_INSET };
  }
  return {
    top: IPHONE_DUO_OUTER_CAMERA_INSET,
    bottom: IPHONE_DUO_HOME_INDICATOR_INSET,
  };
}

export function iphoneDuoReservedVars(width: number, height: number) {
  const insets = iphoneDuoReservedInsets(width, height);
  return {
    "--duo-reserved-top": `${insets.top}px`,
    "--duo-reserved-bottom": `${insets.bottom}px`,
  };
}

export function iphoneDuoDeviceChromeClass(width: number, height: number) {
  if (iphoneDuoChromeAxis(width, height) !== "vertical") return "";
  return isIphoneDuoInnerCanvas(width)
    ? " pageCanvasDevice--duoSideChrome"
    : " pageCanvasDevice--duoSideChrome pageCanvasDevice--duoOuter";
}

/** 内屏双栏时单侧可用宽度。全开态折痕不是固定 gutter；半折时再避让 ReservedRegion。 */
export function iphoneDuoPaneWidth(canvasWidth: number) {
  if (!isIphoneDuoInnerCanvas(canvasWidth)) return canvasWidth;
  return Math.floor(canvasWidth / 2);
}

export function iphoneDuoCanvasClass(width: number) {
  return isIphoneDuoInnerCanvas(width)
    ? "prototypePrimaryDuo prototypePrimaryDuo--inner"
    : "prototypePrimaryDuo";
}
