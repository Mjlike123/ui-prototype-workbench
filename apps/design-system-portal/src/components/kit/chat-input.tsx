"use client";

import {
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { SystemIcon, type SystemIconName } from "./system-icon";

export type ChatInputMode = "text" | "voice";

export type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  mode?: ChatInputMode;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  onFocus?: () => void;
  onModeChange?: (mode: ChatInputMode) => void;
  onPhoto?: () => void;
  onEmoji?: () => void;
  onGame?: () => void;
  onGift?: () => void;
  onVoiceHoldStart?: () => void;
  onVoiceHoldEnd?: () => void;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  mode = "text",
  placeholder = "Say something...",
  ariaLabel = "发送私聊消息",
  disabled = false,
  onFocus,
  onModeChange,
  onPhoto,
  onEmoji,
  onGame,
  onGift,
  onVoiceHoldStart,
  onVoiceHoldEnd,
}: ChatInputProps) {
  const [holdingVoice, setHoldingVoice] = useState(false);
  const holdingVoiceRef = useRef(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasValue = Boolean(value.trim());

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!disabled && hasValue) onSubmit(value.trim());
  };

  const changeMode = () => {
    const nextMode = mode === "text" ? "voice" : "text";
    onModeChange?.(nextMode);
    if (nextMode === "text") {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const startVoiceHold = () => {
    if (holdingVoiceRef.current) return;
    holdingVoiceRef.current = true;
    setHoldingVoice(true);
    onVoiceHoldStart?.();
  };

  const stopVoiceHold = () => {
    if (!holdingVoiceRef.current) return;
    holdingVoiceRef.current = false;
    setHoldingVoice(false);
    onVoiceHoldEnd?.();
  };

  const endVoiceHold = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    stopVoiceHold();
  };

  const handleVoiceKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    startVoiceHold();
  };

  const handleVoiceKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    stopVoiceHold();
  };

  return (
    <form
      className={`chatInput chatInput--${mode}`}
      aria-label={ariaLabel}
      onSubmit={submit}
    >
      <ChatInputAction
        label={mode === "text" ? "切换到语音消息" : "切换到文字输入"}
        icon={mode === "text" ? "microphone" : "voice"}
        onClick={changeMode}
        disabled={disabled || !onModeChange}
      />
      <ChatInputAction
        label="发送照片"
        icon="photo"
        onClick={onPhoto}
        disabled={disabled || !onPhoto}
      />

      {mode === "text" ? (
        <label className="chatInputField">
          <span className="visuallyHidden">消息内容</span>
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onFocus={onFocus}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <button
            className="chatInputEmoji"
            type="button"
            aria-label="选择表情"
            disabled={disabled || !onEmoji}
            onClick={onEmoji}
          >
            <SystemIcon name="emoji" />
          </button>
        </label>
      ) : (
        <button
          className={`chatInputVoiceHold${holdingVoice ? " isHolding" : ""}`}
          type="button"
          disabled={
            disabled || (!onVoiceHoldStart && !onVoiceHoldEnd)
          }
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture?.(event.pointerId);
            startVoiceHold();
          }}
          onPointerUp={endVoiceHold}
          onPointerCancel={endVoiceHold}
          onLostPointerCapture={stopVoiceHold}
          onKeyDown={handleVoiceKeyDown}
          onKeyUp={handleVoiceKeyUp}
        >
          {holdingVoice ? "Release to end" : "Hold to talk"}
        </button>
      )}

      <ChatInputAction
        label="打开游戏"
        icon="game"
        onClick={onGame}
        disabled={disabled || !onGame}
      />
      {mode === "text" && !hasValue ? (
        <ChatInputAction
          label="发送礼物"
          icon="gift"
          onClick={onGift}
          disabled={disabled || !onGift}
        />
      ) : (
        <button
          className="chatInputAction chatInputSend"
          type="submit"
          aria-label="发送消息"
          disabled={disabled || (mode === "text" && !hasValue)}
        >
          <SystemIcon name="send" />
        </button>
      )}
    </form>
  );
}

function ChatInputAction({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: SystemIconName;
  disabled: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className="chatInputAction"
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <SystemIcon name={icon} />
    </button>
  );
}
