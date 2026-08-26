import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_CUSTOM_EMOJIS,
  PrototypeEmojiPanel,
  pushRecentEmoji,
  type EmojiSelection,
} from "./prototype-emoji-panel";

describe("PrototypeEmojiPanel", () => {
  it("sends unicode and custom emoji selections", () => {
    const onSelect = vi.fn();
    render(
      <PrototypeEmojiPanel
        recent={[]}
        customEmojis={DEFAULT_CUSTOM_EMOJIS}
        onSelect={onSelect}
        onUploadRequest={vi.fn()}
      />,
    );

    expect(screen.getByText("最近使用")).toBeInTheDocument();
    expect(screen.getByText("所有表情")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Emoji" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByRole("tab", { name: "Heart IP pack" }));
    fireEvent.click(screen.getByRole("button", { name: "Celebration" }));
    expect(onSelect).toHaveBeenCalledWith({
      type: "custom",
      id: "celebration",
      label: "Celebration",
      src: "/prototypes/chat-reply/sticker.png",
    });
  });

  it("deletes draft characters from the emoji sheet backspace control", () => {
    const onDelete = vi.fn();
    render(
      <PrototypeEmojiPanel
        recent={[]}
        customEmojis={DEFAULT_CUSTOM_EMOJIS}
        onSelect={vi.fn()}
        onUploadRequest={vi.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "删除输入字符" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("shows recent items and upload entry", () => {
    const onUploadRequest = vi.fn();
    const recent: EmojiSelection[] = [
      {
        type: "custom",
        id: "celebration",
        label: "Celebration",
        src: "/prototypes/chat-reply/sticker.png",
      },
    ];

    render(
      <PrototypeEmojiPanel
        recent={recent}
        customEmojis={DEFAULT_CUSTOM_EMOJIS}
        onSelect={vi.fn()}
        onUploadRequest={onUploadRequest}
        initialTab="pack-grin"
      />,
    );

    expect(screen.getByRole("button", { name: "Celebration" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Heart IP pack" }));
    fireEvent.click(screen.getByRole("button", { name: "添加自定义表情" }));
    expect(onUploadRequest).toHaveBeenCalledOnce();
  });

  it("deduplicates recent emoji entries", () => {
    const first: EmojiSelection = {
      type: "unicode",
      id: "unicode-🎉",
      label: "🎉",
      value: "🎉",
    };
    const second: EmojiSelection = {
      type: "unicode",
      id: "unicode-👍",
      label: "👍",
      value: "👍",
    };

    expect(pushRecentEmoji([first], second)).toEqual([second, first]);
    expect(pushRecentEmoji([second, first], first)).toEqual([first, second]);
  });
});
