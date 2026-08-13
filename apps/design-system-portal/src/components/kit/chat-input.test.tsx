import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ChatInput, type ChatInputMode } from "./chat-input";

function ControlledChatInput({
  onSubmit = vi.fn(),
  onFocus = vi.fn(),
}: {
  onSubmit?: (value: string) => void;
  onFocus?: () => void;
}) {
  const [value, setValue] = useState("");
  const [mode, setMode] = useState<ChatInputMode>("text");

  return (
    <ChatInput
      value={value}
      mode={mode}
      onChange={setValue}
      onFocus={onFocus}
      onModeChange={setMode}
      onSubmit={(message) => {
        onSubmit(message);
        setValue("");
      }}
    />
  );
}

describe("ChatInput", () => {
  it("switches the trailing action and submits trimmed text", () => {
    const onSubmit = vi.fn();
    const onFocus = vi.fn();
    render(<ControlledChatInput onSubmit={onSubmit} onFocus={onFocus} />);

    expect(screen.getByRole("button", { name: "发送礼物" })).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "消息内容" });
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledOnce();
    fireEvent.change(input, { target: { value: "  See you there  " } });

    expect(
      screen.queryByRole("button", { name: "发送礼物" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "发送消息" }));

    expect(onSubmit).toHaveBeenCalledWith("See you there");
    expect(input).toHaveValue("");
  });

  it("supports the voice hold state and returns to text input", () => {
    const onVoiceHoldStart = vi.fn();
    const onVoiceHoldEnd = vi.fn();
    const { rerender } = render(
      <ChatInput
        value=""
        mode="voice"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onModeChange={vi.fn()}
        onVoiceHoldStart={onVoiceHoldStart}
        onVoiceHoldEnd={onVoiceHoldEnd}
      />,
    );

    const hold = screen.getByRole("button", { name: "Hold to talk" });
    fireEvent.pointerDown(hold, { pointerId: 1 });
    expect(screen.getByRole("button", { name: "Release to end" })).toHaveClass(
      "isHolding",
    );
    fireEvent.pointerUp(hold, { pointerId: 1 });
    expect(onVoiceHoldStart).toHaveBeenCalledOnce();
    expect(onVoiceHoldEnd).toHaveBeenCalledOnce();

    rerender(
      <ChatInput
        value=""
        mode="text"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox", { name: "消息内容" })).toBeInTheDocument();
  });
});
