import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatBubble, ChatReplyPreview } from "./chat-bubble";

describe("ChatBubble", () => {
  it("renders direction, text, timestamp, and delivery feedback", () => {
    const { rerender } = render(
      <ChatBubble
        direction="outgoing"
        text="Much love back to you!"
        timestamp="8:37 PM"
        deliveryStatus="sending"
      />,
    );

    expect(screen.getByRole("group", { name: "发出的文字" })).toHaveAttribute(
      "data-direction",
      "outgoing",
    );
    expect(screen.getByText("Much love back to you!")).toBeInTheDocument();
    expect(screen.getByText("8:37 PM")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: "消息发送中" })).toBeInTheDocument();

    rerender(
      <ChatBubble
        direction="outgoing"
        text="Much love back to you!"
        deliveryStatus="failed"
      />,
    );
    const failedStatus = screen.getByRole("status", { name: "消息发送失败" });
    expect(failedStatus).toBeInTheDocument();
    expect(
      failedStatus.querySelector('[data-system-icon="messageFailed"]'),
    ).toBeInTheDocument();
  });

  it("exposes voice playback and unread state", () => {
    const onVoicePlay = vi.fn();
    const { rerender } = render(
      <ChatBubble
        kind="voice"
        voiceDuration={60}
        voiceState="unread"
        onVoicePlay={onVoicePlay}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "播放语音消息，60 秒" }),
    );
    expect(onVoicePlay).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("未播放")).toBeInTheDocument();

    rerender(
      <ChatBubble
        kind="voice"
        direction="outgoing"
        voiceDuration={60}
        voiceState="unread"
      />,
    );
    expect(screen.queryByLabelText("未播放")).not.toBeInTheDocument();
  });

  it("renders read status membership upsell for outgoing text messages", () => {
    const onActivate = vi.fn();
    render(
      <ChatBubble
        direction="outgoing"
        text="Thanks for being a good fan."
        readStatusUpsell
        onReadStatusActivate={onActivate}
      />,
    );

    expect(
      screen.getByText("Become member to see read status"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Activate membership to see read status",
      }),
    );
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it("disables expired and loading business actions", () => {
    const { container, rerender } = render(
      <ChatBubble
        kind="gift"
        actionState="expired"
        actionDisabledReason="礼物已过期"
      />,
    );

    expect(screen.getByText("送了你一个装扮")).toBeInTheDocument();
    expect(container.querySelector(".chatBubbleGiftMedia img")).toHaveAttribute(
      "src",
      "/prototypes/chat-bubble/outfit-gift.png",
    );
    expect(
      screen.getByRole("button", { name: "Expired，礼物已过期" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Expired，礼物已过期" }),
    ).toHaveAttribute(
      "title",
      "礼物已过期",
    );

    rerender(<ChatBubble kind="action" text="VIP benefit" actionState="loading" />);
    expect(
      screen.getByRole("button", { name: "Loading…，操作暂不可用" }),
    ).toBeDisabled();
  });

  it("runs relationship card actions", () => {
    const onAction = vi.fn();
    render(
      <ChatBubble
        kind="relationship"
        title="We become CP!"
        onAction={onAction}
      />,
    );

    expect(screen.getByLabelText("CP 关系等级 4")).toHaveTextContent("IV4");
    fireEvent.click(screen.getByRole("button", { name: /We become CP!/ }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("renders and activates the Figma reply preview variants", () => {
    const onLocate = vi.fn();
    const { container, rerender } = render(
      <ChatReplyPreview
        direction="outgoing"
        sender="Alice"
        kind="game"
        text="Invites you to play Clash Royale"
        thumbnailSrc="/prototypes/chat-reply/game.png"
        onLocate={onLocate}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "定位到 Alice 的原消息：Invites you to play Clash Royale",
      }),
    );
    expect(onLocate).toHaveBeenCalledOnce();

    rerender(
      <ChatReplyPreview
        sender="Alice"
        text="Unavailable content"
        status="unavailable"
      />,
    );
    expect(
      screen.getByRole("button", { name: "Quoted content is unavailable" }),
    ).toBeDisabled();

    rerender(
      <ChatReplyPreview
        direction="incoming"
        sender="Alice"
        kind="voice"
        text="Voice message"
        voiceDuration={18}
        onLocate={onLocate}
      />,
    );
    expect(
      container.querySelector('[data-system-icon="voice"]'),
    ).toHaveClass("chatReplyPreviewIcon");

    rerender(
      <ChatReplyPreview
        direction="incoming"
        sender="Alice"
        kind="link"
        text="Thanks for being a good fan."
        onLocate={onLocate}
      />,
    );
    expect(
      container.querySelector('[data-system-icon="link"]'),
    ).toHaveClass("chatReplyPreviewIcon");
  });
});
