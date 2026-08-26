import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatEmojiGifPanel } from "./chat-emoji-gif-panel";
import { demoChatEmojiGifPanelContentByTab } from "./chat-emoji-gif-panel-assets";

describe("ChatEmojiGifPanel", () => {
  it("renders tab bar and emoji sheet body", () => {
    const demo = demoChatEmojiGifPanelContentByTab();
    render(
      <ChatEmojiGifPanel
        value="emoji"
        onChange={vi.fn()}
        content={demo.emoji}
      />,
    );

    expect(screen.getByRole("tab", { name: "Emoji" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("最近使用")).toBeInTheDocument();
    expect(screen.getByText("所有表情")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "删除输入字符" }),
    ).toBeInTheDocument();
  });

  it("fires cell press and tab change", () => {
    const onChange = vi.fn();
    const onCellPress = vi.fn();
    const demo = demoChatEmojiGifPanelContentByTab();

    render(
      <ChatEmojiGifPanel
        value="gif"
        onChange={onChange}
        content={demo.gif}
        onCellPress={onCellPress}
      />,
    );

    fireEvent.click(screen.getByRole("tab", { name: "Emoji" }));
    expect(onChange).toHaveBeenCalledWith("emoji");
    fireEvent.click(screen.getByRole("button", { name: "添加 GIF" }));
    expect(onCellPress).toHaveBeenCalledWith(
      expect.objectContaining({ id: "add" }),
      "gif",
    );
  });
});
