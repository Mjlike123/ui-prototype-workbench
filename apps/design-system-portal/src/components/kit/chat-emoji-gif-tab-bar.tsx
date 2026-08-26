"use client";

import Image from "next/image";
import type { KeyboardEvent } from "react";
import { SystemIcon } from "./system-icon";
import type { ChatEmojiGifTabIcon, ChatEmojiGifTabItem } from "./chat-emoji-gif-tab-bar-assets";

export type { ChatEmojiGifTabIcon, ChatEmojiGifTabItem };
export {
  CHAT_EMOJI_GIF_TAB_BAR_ASSETS,
  DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS,
  type ChatEmojiGifTabKey,
} from "./chat-emoji-gif-tab-bar-assets";

export function ChatEmojiGifTabBar({
  items,
  value,
  onChange,
  showDivider = true,
  ariaLabel = "表情与 GIF 分类",
  className,
}: {
  items: readonly ChatEmojiGifTabItem[];
  value: string;
  onChange: (key: string) => void;
  showDivider?: boolean;
  ariaLabel?: string;
  className?: string;
}) {
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      nextIndex = Math.min(items.length - 1, index + 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = Math.max(0, index - 1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    }
    if (nextIndex === undefined || nextIndex === index) return;
    event.preventDefault();
    onChange(items[nextIndex].key);
  };

  return (
    <div
      className={[
        "chatEmojiGifTabBar",
        showDivider ? "chatEmojiGifTabBar--divider" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label={ariaLabel}
      data-slot="chat-emoji-gif-tab-bar"
    >
      <div className="chatEmojiGifTabBarScroll">
        {items.map((item, index) => {
          const selected = item.key === value;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={item.label}
              tabIndex={selected ? 0 : -1}
              className={`chatEmojiGifTabBarItem${
                selected ? " chatEmojiGifTabBarItem--selected" : ""
              }`}
              onClick={() => onChange(item.key)}
              onKeyDown={(event) => onKeyDown(event, index)}
            >
              <ChatEmojiGifTabIconView icon={item.icon} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatEmojiGifTabIconView({ icon }: { icon: ChatEmojiGifTabIcon }) {
  if (icon.kind === "system") {
    return <SystemIcon name={icon.name} size={24} />;
  }

  return (
    <Image
      className="chatEmojiGifTabBarProductIcon"
      src={icon.src}
      alt=""
      width={24}
      height={24}
      aria-hidden="true"
    />
  );
}
