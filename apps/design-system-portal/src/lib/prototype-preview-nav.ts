export const prototypePreviewNavTabs = [
  { href: "/canvas/core", label: "核心模块" },
  { href: "/canvas/studio", label: "原型创作" },
] as const;

export type PrototypePreviewNavTab =
  (typeof prototypePreviewNavTabs)[number]["href"];

export const prototypePreviewBreadcrumbRoot = {
  label: "原型预览",
  href: "/canvas/core",
} as const;

export function getPrototypePreviewBreadcrumb(currentLabel: string) {
  return [prototypePreviewBreadcrumbRoot, { label: currentLabel }];
}
