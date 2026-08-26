import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ChatEmojiGifTabBar,
  DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS,
} from "./chat-emoji-gif-tab-bar";

describe("ChatEmojiGifTabBar", () => {
  it("renders tabs and switches selection", () => {
    const onChange = vi.fn();
    render(
      <ChatEmojiGifTabBar
        items={DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS}
        value="emoji"
        onChange={onChange}
      />,
    );

    expect(
      screen.getByRole("tablist", { name: "表情与 GIF 分类" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "GIF" })).toHaveAttribute(
      "aria-selected",
      "false",
    );

    fireEvent.click(screen.getByRole("tab", { name: "GIF" }));
    expect(onChange).toHaveBeenCalledWith("gif");
  });

  it("supports arrow key navigation", () => {
    const onChange = vi.fn();
    render(
      <ChatEmojiGifTabBar
        items={DEFAULT_CHAT_EMOJI_GIF_TAB_ITEMS.slice(0, 3)}
        value="emoji"
        onChange={onChange}
      />,
    );

    fireEvent.keyDown(screen.getByRole("tab", { name: "Emoji" }), {
      key: "ArrowRight",
    });
    expect(onChange).toHaveBeenCalledWith("gif");
  });
});
