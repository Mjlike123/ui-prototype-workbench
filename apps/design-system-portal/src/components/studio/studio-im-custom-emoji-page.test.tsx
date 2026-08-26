import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioImCustomEmojiPage } from "./studio-im-custom-emoji-page";
import { loadStudioCustomEmojis } from "@/lib/studio-im-custom-emoji-session";

describe("StudioImCustomEmojiPage", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("renders im chat shell with kit navigation and bubbles", () => {
    render(<StudioImCustomEmojiPage onBack={vi.fn()} />);
    expect(document.querySelector(".studioImCustomEmojiDevice")).toBeInTheDocument();
    expect(document.querySelector(".privateChatNavigation")).toBeInTheDocument();
    expect(document.querySelector(".regularNavigation")).not.toBeInTheDocument();
    expect(document.querySelector(".studioImChatHeader")).not.toBeInTheDocument();
    expect(document.querySelector(".chatBubble")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Andrew" })).toBeInTheDocument();

    expect(screen.getByRole("tab", { name: "Emoji" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("最近使用")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "消息内容" })).toHaveValue(
      "hello😊😊😊",
    );
  });

  it("adds image emoji from file picker and sends after processing", async () => {
    class MockFileReader {
      result = "data:image/png;base64,Zm9v";
      onload: (() => void) | null = null;
      readAsDataURL() {
        this.onload?.();
      }
    }
    vi.stubGlobal("FileReader", MockFileReader);
    vi.useFakeTimers();

    render(<StudioImCustomEmojiPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "Heart IP pack" }));
    fireEvent.click(screen.getByRole("button", { name: "添加图片表情" }));

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["emoji"], "cool.png", { type: "image/png" });
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByRole("heading", { name: "添加图片表情" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "添加到 Custom" }));

    await act(async () => {
      vi.advanceTimersByTime(900);
    });

    expect(loadStudioCustomEmojis().some((item) => item.label === "cool")).toBe(
      true,
    );

    fireEvent.click(screen.getByRole("button", { name: "cool" }));
    expect(screen.getByRole("img", { name: "cool" })).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
