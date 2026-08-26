"use client";

import { useMemo, useState } from "react";
import {
  ChatEmojiGifPanel,
  type ChatEmojiGifPanelCell,
  type ChatEmojiGifPanelContent,
} from "@/components/kit/chat-emoji-gif-panel";
import { CHAT_EMOJI_GIF_PANEL_ASSETS } from "@/components/kit/chat-emoji-gif-panel-assets";
import type { ChatEmojiGifTabKey } from "@/components/kit/chat-emoji-gif-tab-bar";
import type {
  StudioCustomEmojiItem,
  StudioEmojiSelection,
} from "@/lib/studio-im-custom-emoji-session";

export type StudioEmojiPanelTab = ChatEmojiGifTabKey;

type StudioCustomEmojiPanelProps = {
  recent: StudioEmojiSelection[];
  customEmojis: StudioCustomEmojiItem[];
  onSelect: (selection: StudioEmojiSelection) => void;
  onAddImageRequest: () => void;
  onDelete?: () => void;
  initialTab?: StudioEmojiPanelTab;
};

export function StudioCustomEmojiPanel({
  recent,
  customEmojis,
  onSelect,
  onAddImageRequest,
  onDelete,
  initialTab = "emoji",
}: StudioCustomEmojiPanelProps) {
  const [tab, setTab] = useState<StudioEmojiPanelTab>(initialTab);
  const content = useMemo(
    () => buildStudioEmojiPanelContent(tab, recent, customEmojis),
    [tab, recent, customEmojis],
  );

  return (
    <ChatEmojiGifPanel
      className="studioImEmojiPanel"
      ariaLabel="Studio 自定义表情面板"
      value={tab}
      onChange={(key) => setTab(key as StudioEmojiPanelTab)}
      content={content}
      onCellPress={(cell) =>
        handleCellPress(cell, onSelect, onAddImageRequest)
      }
      onDelete={onDelete}
      onVipAction={() => undefined}
    />
  );
}

function buildStudioEmojiPanelContent(
  tab: StudioEmojiPanelTab,
  recent: StudioEmojiSelection[],
  customEmojis: StudioCustomEmojiItem[],
): ChatEmojiGifPanelContent {
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
            label: "添加图片表情",
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
    case "pack-vip":
      return {
        variant: "empty",
        message:
          tab === "pack-vip" ? "VIP 贴纸包待解锁" : "该贴纸包暂无内容",
      };
    default:
      return { variant: "empty", message: "暂无内容" };
  }
}

function handleCellPress(
  cell: ChatEmojiGifPanelCell,
  onSelect: (selection: StudioEmojiSelection) => void,
  onAddImageRequest: () => void,
) {
  if (cell.kind === "add") {
    onAddImageRequest();
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

function selectionToCell(item: StudioEmojiSelection): ChatEmojiGifPanelCell {
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
