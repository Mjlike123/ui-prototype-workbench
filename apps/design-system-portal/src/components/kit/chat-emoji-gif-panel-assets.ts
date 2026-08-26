export const CHAT_EMOJI_GIF_PANEL_ASSETS = {
  emojiSheet: "/icons/product/chat-emoji-gif-panel/emoji/emoji-sheet.png",
  recentStrip: "/icons/product/chat-emoji-gif-panel/emoji/recent-strip.png",
  gif: [
    "/icons/product/chat-emoji-gif-panel/gif/gif-1.png",
    "/icons/product/chat-emoji-gif-panel/gif/gif-2.png",
    "/icons/product/chat-emoji-gif-panel/gif/gif-3.png",
    "/icons/product/chat-emoji-gif-panel/gif/gif-4.png",
    "/icons/product/chat-emoji-gif-panel/gif/gif-5.png",
    "/icons/product/chat-emoji-gif-panel/gif/gif-6.png",
  ],
  toppy: [
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-1.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-2.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-3.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-4.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-5.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-6.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-7.png",
    "/icons/product/chat-emoji-gif-panel/toppy/toppy-8.png",
  ],
  mic: [
    "/icons/product/chat-emoji-gif-panel/mic/mic-1.png",
    "/icons/product/chat-emoji-gif-panel/mic/mic-2.png",
    "/icons/product/chat-emoji-gif-panel/mic/mic-3.png",
    "/icons/product/chat-emoji-gif-panel/mic/mic-4.png",
  ],
} as const;

export type ChatEmojiGifPanelCell =
  | {
      kind: "unicode";
      id: string;
      label: string;
      value: string;
    }
  | {
      kind: "image";
      id: string;
      label: string;
      src: string;
      disabled?: boolean;
    }
  | {
      kind: "add";
      id: string;
      label: string;
    };

export type ChatEmojiGifPanelSection = {
  title?: string;
  cells: ChatEmojiGifPanelCell[];
};

export type ChatEmojiGifPanelContent =
  | {
      variant: "unicode-grid";
      sections: ChatEmojiGifPanelSection[];
      showDelete?: boolean;
    }
  | {
      variant: "emoji-sheet";
      recentTitle?: string;
      allTitle?: string;
      recentStripSrc?: string;
      sheetSrc: string;
      showDelete?: boolean;
    }
  | {
      variant: "media-grid";
      cells: ChatEmojiGifPanelCell[];
    }
  | {
      variant: "vip-locked";
      title: string;
      actionLabel: string;
      backdropCells?: ChatEmojiGifPanelCell[];
    }
  | {
      variant: "empty";
      message: string;
    };

export function demoGifCells(): ChatEmojiGifPanelCell[] {
  return [
    { kind: "add", id: "add", label: "添加 GIF" },
    ...CHAT_EMOJI_GIF_PANEL_ASSETS.gif.map((src, index) => ({
      kind: "image" as const,
      id: `gif-${index + 1}`,
      label: `GIF ${index + 1}`,
      src,
    })),
  ];
}

export function demoImageCells(
  assets: readonly string[],
  prefix: string,
): ChatEmojiGifPanelCell[] {
  return assets.map((src, index) => ({
    kind: "image" as const,
    id: `${prefix}-${index + 1}`,
    label: `${prefix} ${index + 1}`,
    src,
  }));
}

export function demoChatEmojiGifPanelContentByTab(): Record<
  string,
  ChatEmojiGifPanelContent
> {
  return {
    emoji: {
      variant: "emoji-sheet",
      recentTitle: "最近使用",
      allTitle: "所有表情",
      recentStripSrc: CHAT_EMOJI_GIF_PANEL_ASSETS.recentStrip,
      sheetSrc: CHAT_EMOJI_GIF_PANEL_ASSETS.emojiSheet,
      showDelete: true,
    },
    gif: {
      variant: "media-grid",
      cells: demoGifCells(),
    },
    "pack-grin": {
      variant: "media-grid",
      cells: demoImageCells(CHAT_EMOJI_GIF_PANEL_ASSETS.mic, "Mic sticker"),
    },
    "pack-coin": {
      variant: "media-grid",
      cells: demoImageCells(
        CHAT_EMOJI_GIF_PANEL_ASSETS.gif.slice(0, 4),
        "Large emoji",
      ),
    },
    "pack-heart": {
      variant: "media-grid",
      cells: demoImageCells(CHAT_EMOJI_GIF_PANEL_ASSETS.toppy, "Toppy"),
    },
    "pack-vip": {
      variant: "vip-locked",
      title: "VIP exclusive emojis",
      actionLabel: "Open VIP",
      backdropCells: demoImageCells(
        CHAT_EMOJI_GIF_PANEL_ASSETS.toppy,
        "Toppy",
      ),
    },
  };
}
