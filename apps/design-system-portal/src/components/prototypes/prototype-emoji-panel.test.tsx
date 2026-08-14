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

    fireEvent.click(screen.getByRole("tab", { name: "Emoji" }));
    fireEvent.click(screen.getByRole("button", { name: "🎉" }));
    expect(onSelect).toHaveBeenCalledWith({
      type: "unicode",
      id: "unicode-🎉",
      label: "🎉",
      value: "🎉",
    });

    fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
    fireEvent.click(screen.getByRole("button", { name: "Celebration" }));
    expect(onSelect).toHaveBeenLastCalledWith({
      type: "custom",
      id: "celebration",
      label: "Celebration",
      src: "/prototypes/chat-reply/sticker.png",
    });
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
      />,
    );

    expect(screen.getByRole("button", { name: "Celebration" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
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
