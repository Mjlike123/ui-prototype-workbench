export const EMPTY_STATE_ILLUSTRATIONS = {
  "no-list": {
    src: "/icons/empty-state/no-list.png",
    label: "没有榜单",
  },
  "no-content": {
    src: "/icons/empty-state/no-content.png",
    label: "没有内容",
  },
  "no-content-3x": {
    src: "/icons/empty-state/no-content-3x.png",
    label: "没有内容 @3x",
  },
  "no-network": {
    src: "/icons/empty-state/no-network.png",
    label: "没有网络",
  },
  "no-news": {
    src: "/icons/empty-state/no-news.png",
    label: "没有消息",
  },
  "no-friends": {
    src: "/icons/empty-state/no-friends.png",
    label: "没有好友",
  },
  "no-game-friends": {
    src: "/icons/empty-state/no-game-friends.png",
    label: "没有游戏好友",
  },
  "no-gift": {
    src: "/icons/empty-state/no-gift.png",
    label: "没有礼物",
  },
  "no-recharge": {
    src: "/icons/empty-state/no-recharge.png",
    label: "没有充值记录",
  },
  "no-vehicle": {
    src: "/icons/empty-state/no-vehicle.png",
    label: "没有座驾",
  },
  "no-positioning": {
    src: "/icons/empty-state/no-positioning.png",
    label: "没有定位",
  },
  "no-attention-room": {
    src: "/icons/empty-state/no-attention-room.png",
    label: "没有关注房间",
  },
  "list-not-found": {
    src: "/icons/empty-state/list-not-found.png",
    label: "列表未找到",
  },
} as const;

export type EmptyStateIllustration = keyof typeof EMPTY_STATE_ILLUSTRATIONS;

export const DEFAULT_EMPTY_STATE_ILLUSTRATION: EmptyStateIllustration =
  "no-list";

export function resolveEmptyStateIllustrationSrc(
  illustration?: EmptyStateIllustration,
  illustrationSrc?: string,
) {
  if (illustrationSrc) return illustrationSrc;
  const key = illustration ?? DEFAULT_EMPTY_STATE_ILLUSTRATION;
  return EMPTY_STATE_ILLUSTRATIONS[key].src;
}
