"use client";

import Image from "next/image";
import { useState, type KeyboardEvent, type ReactNode } from "react";
import { SystemIcon } from "@/components/kit/system-icon";

export type EmojiPanelTab = "recent" | "emoji" | "custom";

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

const PANEL_TABS: { key: EmojiPanelTab; label: string }[] = [
  { key: "recent", label: "Recent" },
  { key: "emoji", label: "Emoji" },
  { key: "custom", label: "Custom" },
];

export function PrototypeEmojiPanel({
  recent,
  customEmojis,
  onSelect,
  onUploadRequest,
}: {
  recent: EmojiSelection[];
  customEmojis: CustomEmojiItem[];
  onSelect: (selection: EmojiSelection) => void;
  onUploadRequest: () => void;
}) {
  const [tab, setTab] = useState<EmojiPanelTab>("recent");

  const onTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      nextIndex = Math.min(PANEL_TABS.length - 1, index + 1);
    }
    if (event.key === "ArrowLeft") {
      nextIndex = Math.max(0, index - 1);
    }
    if (nextIndex === undefined || nextIndex === index) return;
    event.preventDefault();
    setTab(PANEL_TABS[nextIndex].key);
  };

  return (
    <section
      className="prototypeEmojiPanel"
      aria-label="表情面板"
      data-open="true"
    >
      <div
        className="secondaryTabUnderline prototypeEmojiPanelTabs"
        role="tablist"
        aria-label="表情分类"
      >
        {PANEL_TABS.map((item, index) => {
          const selected = item.key === tab;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={selected ? "selected" : ""}
              onClick={() => setTab(item.key)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="prototypeEmojiPanelBody" role="tabpanel">
        {tab === "recent" ? (
          <EmojiGrid
            emptyLabel="最近使用的表情会出现在这里"
            items={recent.map((item) => ({
              key: item.id,
              label: item.label,
              content:
                item.type === "unicode" ? (
                  <span className="prototypeEmojiPanelGlyph">{item.value}</span>
                ) : (
                  <Image src={item.src} alt="" width={56} height={56} />
                ),
              onPress: () => onSelect(item),
            }))}
          />
        ) : null}

        {tab === "emoji" ? (
          <EmojiGrid
            items={SYSTEM_EMOJIS.map((emoji) => ({
              key: emoji,
              label: emoji,
              content: (
                <span className="prototypeEmojiPanelGlyph">{emoji}</span>
              ),
              onPress: () =>
                onSelect({
                  type: "unicode",
                  id: `unicode-${emoji}`,
                  label: emoji,
                  value: emoji,
                }),
            }))}
          />
        ) : null}

        {tab === "custom" ? (
          <EmojiGrid
            items={[
              {
                key: "upload",
                label: "添加自定义表情",
                content: (
                  <span className="prototypeEmojiPanelAdd">
                    <SystemIcon name="addCircle" size={24} />
                  </span>
                ),
                onPress: onUploadRequest,
              },
              ...customEmojis.map((emoji) => ({
                key: emoji.id,
                label: emoji.label,
                content: (
                  <>
                    <Image src={emoji.src} alt="" width={56} height={56} />
                    {emoji.status === "pending" ? (
                      <span className="prototypeEmojiPanelPending">审核中</span>
                    ) : null}
                  </>
                ),
                disabled: emoji.status === "pending",
                onPress: () =>
                  onSelect({
                    type: "custom",
                    id: emoji.id,
                    label: emoji.label,
                    src: emoji.src,
                  }),
              })),
            ]}
          />
        ) : null}
      </div>
    </section>
  );
}

function EmojiGrid({
  items,
  emptyLabel,
}: {
  items: {
    key: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
    onPress: () => void;
  }[];
  emptyLabel?: string;
}) {
  if (items.length === 0 && emptyLabel) {
    return <p className="prototypeEmojiPanelEmpty">{emptyLabel}</p>;
  }

  return (
    <div className="prototypeEmojiPanelGrid" role="group" aria-label="表情列表">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="prototypeEmojiPanelCell"
          aria-label={item.label}
          disabled={item.disabled}
          onClick={item.onPress}
        >
          {item.content}
        </button>
      ))}
    </div>
  );
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
