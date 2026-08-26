"use client";

import { useMemo, useState } from "react";
import {
  ChatEmojiGifPanel,
  type ChatEmojiGifPanelCell,
  type ChatEmojiGifPanelContent,
} from "@/components/kit/chat-emoji-gif-panel";
import { CHAT_EMOJI_GIF_PANEL_ASSETS } from "@/components/kit/chat-emoji-gif-panel-assets";
import type { ChatEmojiGifTabKey } from "@/components/kit/chat-emoji-gif-tab-bar";

export type EmojiPanelTab = ChatEmojiGifTabKey;

export type CustomEmojiItem = {
  id: string;
  label: string;
  src: string;
  status?: "active" | "pending";
};

export type EmojiSelection =
  | {
      type: "unicode";
      id: string;
      label: string;
      value: string;
    }
  | {
      type: "custom";
      id: string;
      label: string;
      src: string;
    };

export const DEFAULT_CUSTOM_EMOJIS: CustomEmojiItem[] = [
  {
    id: "celebration",
    label: "Celebration",
    src: "/prototypes/chat-reply/sticker.png",
  },
  {
    id: "gg",
    label: "GG",
    src: "/prototypes/feed/andrew-avatar.png",
  },
  {
    id: "heart-eyes",
    label: "Heart eyes",
    src: "/prototypes/feed/latifa-avatar.png",
  },
  {
    id: "supporter",
    label: "Supporter",
    src: "/prototypes/profile-v3/supporter-card.png",
  },
];

const SYSTEM_EMOJIS = [
  "😀",
  "😂",
  "🥰",
  "😎",
  "🤔",
  "😭",
  "👍",
  "👏",
  "🎉",
  "❤️",
  "🔥",
  "✨",
  "🙏",
  "💯",
  "🫶",
  "😴",
] as const;

export function PrototypeEmojiPanel({
  recent,
  customEmojis,
  onSelect,
  onUploadRequest,
  onDelete,
  initialTab = "emoji",
}: {
  recent: EmojiSelection[];
  customEmojis: CustomEmojiItem[];
  onSelect: (selection: EmojiSelection) => void;
  onUploadRequest: () => void;
  onDelete?: () => void;
  initialTab?: EmojiPanelTab;
}) {
  const [tab, setTab] = useState<EmojiPanelTab>(initialTab);
  const content = useMemo(
    () => buildPrototypeEmojiPanelContent(tab, recent, customEmojis),
    [tab, recent, customEmojis],
  );

  return (
    <ChatEmojiGifPanel
      className="prototypeEmojiPanel"
      ariaLabel="表情面板"
      value={tab}
      onChange={(key) => setTab(key as EmojiPanelTab)}
      content={content}
      onCellPress={(cell) => handleCellPress(cell, onSelect, onUploadRequest)}
      onDelete={onDelete}
      onVipAction={() => undefined}
    />
  );
}

function buildPrototypeEmojiPanelContent(
  tab: EmojiPanelTab,
  recent: EmojiSelection[],
  customEmojis: CustomEmojiItem[],
): ChatEmojiGifPanelContent {
  const [packCoinItems, packVipItems] = splitCustomEmojiPacks(customEmojis);

  switch (tab) {
    case "emoji":
      return {
        variant: "emoji-sheet",
        recentTitle: "最近使用",
        allTitle: "所有表情",
        recentStripSrc: CHAT_EMOJI_GIF_PANEL_ASSETS.recentStrip,
        sheetSrc: CHAT_EMOJI_GIF_PANEL_ASSETS.emojiSheet,
        showDelete: true,
      };
    case "gif":
      return { variant: "empty", message: "GIF 库待接入" };
    case "pack-grin":
      if (recent.length === 0) {
        return {
          variant: "empty",
          message: "最近使用的表情会出现在这里",
        };
      }
      return {
        variant: "unicode-grid",
        sections: [
          {
            title: "最近使用",
            cells: recent.map((item) => selectionToCell(item)),
          },
        ],
      };
    case "pack-heart":
      return {
        variant: "media-grid",
        cells: [
          {
            kind: "add",
            id: "upload",
            label: "添加自定义表情",
          },
          ...customEmojis.map((emoji) => ({
            kind: "image" as const,
            id: emoji.id,
            label: emoji.label,
            src: emoji.src,
            disabled: emoji.status === "pending",
          })),
        ],
      };
    case "pack-coin":
      if (packCoinItems.length === 0) {
        return { variant: "empty", message: "该贴纸包暂无内容" };
      }
      return {
        variant: "media-grid",
        cells: packCoinItems.map((emoji) => ({
          kind: "image" as const,
          id: emoji.id,
          label: emoji.label,
          src: emoji.src,
        })),
      };
    case "pack-vip":
      return {
        variant: "vip-locked",
        title: "VIP exclusive emojis",
        actionLabel: "Open VIP",
        backdropCells: packVipItems.map((emoji) => ({
          kind: "image" as const,
          id: emoji.id,
          label: emoji.label,
          src: emoji.src,
        })),
      };
    default:
      return { variant: "empty", message: "暂无内容" };
  }
}

function handleCellPress(
  cell: ChatEmojiGifPanelCell,
  onSelect: (selection: EmojiSelection) => void,
  onUploadRequest: () => void,
) {
  if (cell.kind === "add") {
    onUploadRequest();
    return;
  }
  if (cell.kind === "unicode") {
    onSelect({
      type: "unicode",
      id: cell.id,
      label: cell.label,
      value: cell.value,
    });
    return;
  }
  onSelect({
    type: "custom",
    id: cell.id,
    label: cell.label,
    src: cell.src,
  });
}

function selectionToCell(item: EmojiSelection): ChatEmojiGifPanelCell {
  if (item.type === "unicode") {
    return {
      kind: "unicode",
      id: item.id,
      label: item.label,
      value: item.value,
    };
  }
  return {
    kind: "image",
    id: item.id,
    label: item.label,
    src: item.src,
  };
}

function splitCustomEmojiPacks(customEmojis: CustomEmojiItem[]) {
  const midpoint = Math.ceil(customEmojis.length / 2);
  return [customEmojis.slice(0, midpoint), customEmojis.slice(midpoint)] as const;
}

export function pushRecentEmoji(
  recent: EmojiSelection[],
  selection: EmojiSelection,
  limit = 8,
) {
  const next = [
    selection,
    ...recent.filter((item) => item.id !== selection.id),
  ].slice(0, limit);
  return next;
}
