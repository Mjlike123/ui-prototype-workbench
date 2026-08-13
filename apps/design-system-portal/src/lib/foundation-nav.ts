export const foundationNavItems = [
  { id: "semantic-colors", label: "色彩" },
  { id: "icons", label: "图标" },
  { id: "motion", label: "动效" },
  { id: "responsive-layout", label: "宽屏适配" },
  { id: "radius", label: "圆角" },
  { id: "spacing", label: "间距" },
  { id: "typography", label: "字体" },
] as const;

export const foundationNavTabs = foundationNavItems.map(({ id, label }) => ({
  href: `/foundations#${id}`,
  label,
}));

const foundationNavOrder = new Map<string, number>(
  foundationNavItems.map((item, index) => [item.id, index]),
);

const foundationNavLabels = new Map<string, string>(
  foundationNavItems.map((item) => [item.id, item.label]),
);

export function sortFoundationsByNavOrder<T extends { id: string }>(
  foundations: T[],
): T[] {
  return [...foundations].sort(
    (a, b) =>
      (foundationNavOrder.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (foundationNavOrder.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );
}

export function getFoundationNavLabel(id: string): string {
  return foundationNavLabels.get(id) ?? id;
}
