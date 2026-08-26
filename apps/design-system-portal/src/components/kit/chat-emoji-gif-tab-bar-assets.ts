export const CHAT_EMOJI_GIF_TAB_BAR_ASSETS = {
  packGrin: "/icons/product/chat-emoji-gif-tab/pack-grin.png",
  packCoin: "/icons/product/chat-emoji-gif-tab/pack-coin.png",
  packHeart: "/icons/product/chat-emoji-gif-tab/pack-heart.png",
  packVip: "/icons/product/chat-emoji-gif-tab/pack-vip.png",
} as const;

export type ChatEmojiGifTabIcon =
  | { kind: "system"; name: "emoji" | "gif" }
  | { kind: "product"; src: string };

export type ChatEmojiGifTabItem = {
  key: string;
  label: string;
  icon: ChatEmojiGifTabIcon;
};

export const DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS: ChatEmojiGifTabItem[] = [
  { key: "emoji", label: "Emoji", icon: { kind: "system", name: "emoji" } },
  { key: "gif", label: "GIF", icon: { kind: "system", name: "gif" } },
  {
    key: "pack-grin",
    label: "Grin sticker pack",
    icon: { kind: "product", src: CHAT_EMOJI_GIF_TAB_BAR_ASSETS.packGrin },
  },
  {
    key: "pack-coin",
    label: "Coin sticker pack",
    icon: { kind: "product", src: CHAT_EMOJI_GIF_TAB_BAR_ASSETS.packCoin },
  },
  {
    key: "pack-heart",
    label: "Heart IP pack",
    icon: { kind: "product", src: CHAT_EMOJI_GIF_TAB_BAR_ASSETS.packHeart },
  },
  {
    key: "pack-vip",
    label: "VIP sticker pack",
    icon: { kind: "product", src: CHAT_EMOJI_GIF_TAB_BAR_ASSETS.packVip },
  },
];

export type ChatEmojiGifTabKey =
  (typeof DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS)[number]["key"];
