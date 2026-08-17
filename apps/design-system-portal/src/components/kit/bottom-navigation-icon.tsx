import { BOTTOM_NAVIGATION_ICON_SVGS } from "./generated/bottom-navigation-icon-svgs";
import { InlineSvgIcon } from "./inline-svg-icon";

export const BOTTOM_NAVIGATION_ICON_ASSETS = {
  refresh: {
    outline: "/icons/bottom-navigation/refresh-filled.svg",
    filled: "/icons/bottom-navigation/refresh-filled.svg",
  },
  toptop: {
    outline: "/icons/bottom-navigation/toptop-outline.svg",
    filled: "/icons/bottom-navigation/toptop-filled.svg",
  },
  room: {
    outline: "/icons/bottom-navigation/room-outline.svg",
    filled: "/icons/bottom-navigation/room-filled.svg",
  },
  feed: {
    outline: "/icons/bottom-navigation/feed-outline.svg",
    filled: "/icons/bottom-navigation/feed-filled.svg",
  },
  message: {
    outline: "/icons/bottom-navigation/message-outline.svg",
    filled: "/icons/bottom-navigation/message-filled.svg",
  },
  me: {
    outline: "/icons/bottom-navigation/me-outline.svg",
    filled: "/icons/bottom-navigation/me-filled.svg",
  },
} as const;

export type BottomNavigationIconName = keyof typeof BOTTOM_NAVIGATION_ICON_ASSETS;

export function BottomNavigationIcon({
  name,
  selected = false,
  className,
}: {
  name: BottomNavigationIconName;
  selected?: boolean;
  className?: string;
}) {
  const asset = BOTTOM_NAVIGATION_ICON_ASSETS[name];
  const variant = selected ? "filled" : "outline";

  return (
    <InlineSvgIcon
      className={["bottomNavigationGlyph", className].filter(Boolean).join(" ")}
      markup={BOTTOM_NAVIGATION_ICON_SVGS[name][variant]}
      size={36}
      data-bottom-nav-icon={name}
      data-bottom-nav-selected={selected ? "true" : "false"}
      data-bottom-nav-asset={selected ? asset.filled : asset.outline}
    />
  );
}
