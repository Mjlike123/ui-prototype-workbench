import type { PrototypeAppScreen } from "@/lib/prototype-app-routes";

export const PROTOTYPE_PRIMARY_SCREENS = [
  "toptop",
  "room",
  "feed",
  "message",
  "me",
] as const satisfies readonly PrototypeAppScreen[];

export type PrototypePrimaryScreen = (typeof PROTOTYPE_PRIMARY_SCREENS)[number];

export const PROTOTYPE_NAV_PUSH_MS = 320;
export const PROTOTYPE_NAV_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

const primarySet = new Set<string>(PROTOTYPE_PRIMARY_SCREENS);

export function isPrototypePrimaryScreen(
  screen: PrototypeAppScreen,
): screen is PrototypePrimaryScreen {
  return primarySet.has(screen);
}

export function isPrototypeSecondaryScreen(screen: PrototypeAppScreen) {
  return !isPrototypePrimaryScreen(screen);
}

/** 底栏一级目的地切换：无层级 push 动画。 */
export function isPrototypeTabSwitch(
  from: PrototypeAppScreen,
  to: PrototypeAppScreen,
) {
  return isPrototypePrimaryScreen(from) && isPrototypePrimaryScreen(to);
}

/** 进入二级页：一级 → 二级，或二级 → 二级。 */
export function shouldPrototypePush(
  from: PrototypeAppScreen,
  to: PrototypeAppScreen,
) {
  if (isPrototypeTabSwitch(from, to)) return false;
  return isPrototypeSecondaryScreen(to);
}

/** 返回一级：二级 → 一级。 */
export function shouldPrototypePop(
  from: PrototypeAppScreen,
  to: PrototypeAppScreen,
) {
  return isPrototypeSecondaryScreen(from) && isPrototypePrimaryScreen(to);
}

export function prefersReducedMotionNavigation() {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
