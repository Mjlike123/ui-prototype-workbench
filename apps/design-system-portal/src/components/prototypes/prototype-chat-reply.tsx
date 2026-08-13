"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  type KeyboardEvent,
} from "react";
import {
  ChatReplyPreview,
  type ChatBubbleDirection,
  type ChatReplyPreviewKind,
  type ChatReplyPreviewStatus,
} from "@/components/kit/chat-bubble";
import { SystemIcon } from "@/components/kit/system-icon";

export type PrototypeMessageKind = "text" | "image" | "emoji" | "voice";
export type PrototypeMessageStatus = "active" | "deleted" | "recalled";

/** Figma 237:5492 — 正在回复上下文栏内容类型 */
export type PrototypeReplyContextKind =
  | "text"
  | "image"
  | "emoji"
  | "voice"
  | "link"
  | "game"
  | "gift"
  | "token"
  | "activity"
  | "groupGift";

export type PrototypeReplyTarget = {
  id: string;
  sender: string;
  kind: PrototypeReplyContextKind;
  preview: string;
  status: PrototypeMessageStatus;
  thumbnailSrc?: string;
  voiceDuration?: number;
};

export type PrototypeQuote = Omit<PrototypeReplyTarget, "kind" | "status"> & {
  sourceId: string;
  kind: ChatReplyPreviewKind | "emoji";
  status: ChatReplyPreviewStatus;
  thumbnailSrc?: string;
  imageAspect?: "square" | "portrait";
  voiceDuration?: number;
};

export function PrototypeMessagePayload({
  kind,
  text,
}: {
  kind: PrototypeMessageKind;
  text: string;
}) {
  if (kind === "image") {
    return (
      <span className="prototypeMessageImage" role="img" aria-label="海边图片">
        <span>海</span>
      </span>
    );
  }

  if (kind === "emoji") {
    return (
      <span className="prototypeMessageEmoji" role="img" aria-label="庆祝">
        🎉
      </span>
    );
  }

  if (kind === "voice") {
    return (
      <span className="prototypeMessageVoice" aria-label="语音消息，18 秒">
        <span className="prototypeVoicePlay" aria-hidden="true">
          ▶
        </span>
        <span className="prototypeVoiceWave" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>18″</span>
      </span>
    );
  }

  return <span className="prototypeMessageText">{text}</span>;
}

export function PrototypeReplyContextBar({
  target,
  onClose,
}: {
  target: PrototypeReplyTarget;
  onClose: () => void;
}) {
  const thumbSrc = replyContextThumbnail(target);
  const showThumb = Boolean(thumbSrc);
  const showLeadingIcon = target.kind === "voice" || target.kind === "link";

  return (
    <section
      className="prototypeReplyContext"
      aria-label={`正在回复 ${target.sender}`}
      data-kind={target.kind}
    >
      <div className="prototypeReplyContextCopy">
        <strong>回复 {target.sender}</strong>
        <span className="prototypeReplyContextPayload">
          {showLeadingIcon ? (
            <SystemIcon
              name={target.kind === "voice" ? "voice" : "link"}
              size={20}
              className="prototypeReplyContextGlyph"
            />
          ) : null}
          <span>{replyContextLabel(target)}</span>
        </span>
      </div>
      {showThumb && thumbSrc ? (
        <span
          className={`prototypeReplyContextThumb${
            target.kind === "image" || target.kind === "activity"
              ? " hasBorder"
              : ""
          }${target.kind === "emoji" ? " isSticker" : ""}`}
        >
          <Image
            src={thumbSrc}
            alt=""
            width={32}
            height={32}
            unoptimized
          />
        </span>
      ) : null}
      <button type="button" aria-label="取消回复" onClick={onClose}>
        <SystemIcon name="close" size={24} />
      </button>
    </section>
  );
}

export function PrototypeMessageQuote({
  quote,
  direction,
  onLocate,
}: {
  quote: PrototypeQuote;
  direction: ChatBubbleDirection;
  onLocate: (sourceId: string) => void;
}) {
  return (
    <ChatReplyPreview
      direction={direction}
      sender={quote.sender}
      kind={quote.kind === "emoji" ? "gif" : quote.kind}
      text={quotePreview(quote)}
      status={quote.status}
      thumbnailSrc={
        quote.thumbnailSrc ||
        (quote.kind === "image"
          ? "/prototypes/chat-reply/photo-square.png"
          : quote.kind === "emoji"
            ? "/prototypes/chat-reply/sticker.png"
            : undefined)
      }
      imageAspect={quote.imageAspect}
      voiceDuration={quote.voiceDuration}
      onLocate={
        quote.status === "active"
          ? () => onLocate(quote.sourceId)
          : undefined
      }
    />
  );
}

export type PrototypeMessageMenuAction =
  | "reply"
  | "copy"
  | "recall"
  | "report"
  | "delete";

export function PrototypeMessageActionMenu({
  direction,
  onAction,
  onDismiss,
  isExiting = false,
  onExitComplete,
}: {
  direction: "incoming" | "outgoing";
  onAction: (action: PrototypeMessageMenuAction) => void;
  onDismiss: () => void;
  isExiting?: boolean;
  onExitComplete?: () => void;
}) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const actions: Array<{
    id: PrototypeMessageMenuAction;
    label: string;
    destructive?: boolean;
  }> = [
    { id: "reply", label: "回复" },
    { id: "copy", label: "复制" },
    ...(direction === "outgoing"
      ? ([{ id: "recall", label: "撤回" }] as const)
      : ([{ id: "report", label: "举报" }] as const)),
    { id: "delete", label: "删除", destructive: true },
  ];

  useEffect(() => {
    if (isExiting) return;
    itemRefs.current[0]?.focus();
  }, [isExiting]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isExiting) return;
    const currentIndex = itemRefs.current.findIndex(
      (item) => item === document.activeElement,
    );
    let nextIndex: number | undefined;
    if (event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % actions.length;
    } else if (event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + actions.length) % actions.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = actions.length - 1;
    } else if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
      return;
    }
    if (nextIndex === undefined) return;
    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className={`prototypeMessageMenu${isExiting ? " isExiting" : ""}`}
      role="menu"
      aria-label="消息操作"
      aria-hidden={isExiting || undefined}
      onKeyDown={handleMenuKeyDown}
      onAnimationEnd={(event) => {
        if (!isExiting || event.target !== event.currentTarget) return;
        if (event.animationName !== "prototypeMessageMenuOut") return;
        onExitComplete?.();
      }}
    >
      {actions.map((action, index) => (
        <button
          ref={(node) => {
            itemRefs.current[index] = node;
          }}
          className={action.destructive ? "isDestructive" : undefined}
          type="button"
          role="menuitem"
          key={action.id}
          tabIndex={isExiting ? -1 : undefined}
          disabled={isExiting}
          onClick={() => onAction(action.id)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}

export function PrototypeChatSystemEvent({
  text,
  detail,
  actionLabel,
  onAction,
}: {
  text: string;
  detail?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <section className="prototypeChatSystemEvent" aria-label={text}>
      <p>{text}</p>
      {detail ? <span>{detail}</span> : null}
      {actionLabel && onAction ? (
        <button type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}

function replyContextLabel(target: PrototypeReplyTarget) {
  if (target.status === "deleted") return "消息已删除";
  if (target.status === "recalled") return "该消息已被撤回";
  if (target.kind === "image") return "Photo";
  if (target.kind === "emoji") return "Emoji";
  if (target.kind === "voice") {
    return `${target.voiceDuration ?? 18}''`;
  }
  return target.preview;
}

function replyContextThumbnail(target: PrototypeReplyTarget) {
  if (target.status !== "active") return undefined;
  if (target.thumbnailSrc) return target.thumbnailSrc;
  if (target.kind === "image") return "/prototypes/chat-reply/photo-square.png";
  if (target.kind === "emoji") return "/prototypes/chat-reply/sticker.png";
  if (target.kind === "gift" || target.kind === "token") {
    return "/prototypes/chat-reply/gift.png";
  }
  if (target.kind === "game") return "/prototypes/chat-reply/game.png";
  if (target.kind === "activity") {
    return "/prototypes/chat-reply/activity-square.png";
  }
  if (target.kind === "groupGift") return "/prototypes/chat-reply/token.png";
  return undefined;
}

function quotePreview(target: PrototypeQuote) {
  if (target.status === "deleted") return "消息已删除";
  if (target.status === "recalled") return "该消息已被撤回";
  if (target.status === "unavailable") return "引用内容不存在";
  if (target.kind === "image") return "[图片]";
  if (target.kind === "emoji") return "[表情]";
  if (target.kind === "voice") {
    return `[语音] ${target.voiceDuration ?? 18}″`;
  }
  return target.preview;
}
