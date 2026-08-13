export const TOP_TOP_FRIEND_CELL = 56;
export const TOP_TOP_FRIEND_GAP_MAX = 16;
export const TOP_TOP_FRIEND_GAP_MIN = 8;
export const TOP_TOP_LAYOUT_GUTTER = 32;

export type TopTopFriendStripLayout = {
  columns: number;
  gap: number;
  visibleFriendCount: number;
};

/** 固定 56px 头像列宽；末列留给 7 More，宽屏优先增加可见好友数。 */
export function getTopTopFriendStripLayout(
  canvasWidth: number,
): TopTopFriendStripLayout {
  const contentWidth = canvasWidth - TOP_TOP_LAYOUT_GUTTER;
  const fallback: TopTopFriendStripLayout = {
    columns: 5,
    gap: TOP_TOP_FRIEND_GAP_MAX,
    visibleFriendCount: 4,
  };

  if (contentWidth <= 0) {
    return fallback;
  }

  for (let columns = 10; columns >= 5; columns -= 1) {
    const gap =
      (contentWidth - columns * TOP_TOP_FRIEND_CELL) / (columns - 1);
    if (gap >= TOP_TOP_FRIEND_GAP_MIN && gap <= TOP_TOP_FRIEND_GAP_MAX) {
      return {
        columns,
        gap,
        visibleFriendCount: columns - 1,
      };
    }
  }

  return fallback;
}

export const MESSAGE_ONLINE_FRIEND_CELL = 70;
export const MESSAGE_ONLINE_LIST_PADDING = 10;
export const MESSAGE_ONLINE_GAP_MIN = 3;
export const MESSAGE_ONLINE_GAP_MAX = 16;

export type MessageOnlineFriendStripLayout = {
  columns: number;
  gap: number;
  visibleFriendCount: number;
};

/** Message 在线好友：固定 70px 列宽，末列 7 more 组合头像。 */
export function getMessageOnlineFriendStripLayout(
  canvasWidth: number,
): MessageOnlineFriendStripLayout {
  const contentWidth = canvasWidth - MESSAGE_ONLINE_LIST_PADDING;
  const fallback: MessageOnlineFriendStripLayout = {
    columns: 5,
    gap: 3.75,
    visibleFriendCount: 4,
  };

  if (contentWidth <= 0) {
    return fallback;
  }

  for (let columns = 10; columns >= 5; columns -= 1) {
    const gap =
      (contentWidth - columns * MESSAGE_ONLINE_FRIEND_CELL) / (columns - 1);
    if (gap >= MESSAGE_ONLINE_GAP_MIN && gap <= MESSAGE_ONLINE_GAP_MAX) {
      return {
        columns,
        gap,
        visibleFriendCount: columns - 1,
      };
    }
    if (gap >= 0 && gap < MESSAGE_ONLINE_GAP_MIN) {
      return {
        columns,
        gap: 0,
        visibleFriendCount: columns - 1,
      };
    }
  }

  return fallback;
}
