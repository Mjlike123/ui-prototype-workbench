import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatEmojiGifComposerStack } from "./chat-emoji-gif-composer-stack";

async function flushOpenAnimation() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  });
}

describe("ChatEmojiGifComposerStack", () => {
  it("slides the panel in with standard easing when opening", async () => {
    const { rerender } = render(
      <ChatEmojiGifComposerStack
        open={false}
        input={<input aria-label="消息内容" />}
        panel={<section aria-label="表情面板">Panel</section>}
      />,
    );

    expect(screen.queryByLabelText("表情面板")).not.toBeInTheDocument();

    rerender(
      <ChatEmojiGifComposerStack
        open
        input={<input aria-label="消息内容" />}
        panel={<section aria-label="表情面板">Panel</section>}
      />,
    );

    await flushOpenAnimation();

    expect(screen.getByLabelText("表情面板").parentElement).toHaveClass(
      "chatEmojiGifComposerPanel--visible",
    );
  });

  it("unmounts the panel after the close transition completes", async () => {
    const { rerender } = render(
      <ChatEmojiGifComposerStack
        open
        input={<input aria-label="消息内容" />}
        panel={<section aria-label="表情面板">Panel</section>}
      />,
    );

    rerender(
      <ChatEmojiGifComposerStack
        open={false}
        input={<input aria-label="消息内容" />}
        panel={<section aria-label="表情面板">Panel</section>}
      />,
    );

    const panel = screen.getByLabelText("表情面板").parentElement!;
    fireEvent.transitionEnd(panel, { propertyName: "transform" });

    expect(screen.queryByLabelText("表情面板")).not.toBeInTheDocument();
  });
});
