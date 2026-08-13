"use client";

import Image from "next/image";
import type {
  CSSProperties,
  PointerEventHandler,
  ReactNode,
} from "react";
import { SystemIcon } from "./system-icon";

export type ChatBubbleKind =
  | "text"
  | "voice"
  | "image"
  | "gift"
  | "action"
  | "article"
  | "relationship";

export type ChatBubbleDirection = "incoming" | "outgoing";
export type ChatBubbleDeliveryStatus = "sent" | "sending" | "failed";
export type ChatBubbleVoiceState = "played" | "unread" | "playing";
export type ChatBubbleActionState =
  | "default"
  | "pressed"
  | "disabled"
  | "loading"
  | "expired";

export type ChatReplyPreviewKind =
  | "text"
  | "link"
  | "image"
  | "voice"
  | "gif"
  | "game"
  | "gift"
  | "token"
  | "activity"
  | "mention"
  | "groupGift";

export type ChatReplyPreviewStatus =
  | "active"
  | "deleted"
  | "recalled"
  | "unavailable";

export type ChatReplyPreviewProps = {
  direction?: ChatBubbleDirection;
  sender: string;
  kind?: ChatReplyPreviewKind;
  text: string;
  status?: ChatReplyPreviewStatus;
  thumbnailSrc?: string;
  imageAspect?: "square" | "portrait";
  voiceDuration?: number;
  onLocate?: () => void;
};

export type ChatBubbleProps = {
  children?: ReactNode;
  kind?: ChatBubbleKind;
  direction?: ChatBubbleDirection;
  text?: string;
  title?: string;
  description?: string;
  avatar?: ReactNode;
  timestamp?: string;
  deliveryStatus?: ChatBubbleDeliveryStatus;
  voiceDuration?: number;
  voiceState?: ChatBubbleVoiceState;
  mediaSrc?: string;
  mediaAlt?: string;
  actionLabel?: string;
  actionState?: ChatBubbleActionState;
  actionDisabledReason?: string;
  relationshipAvatars?: ReactNode;
  relationshipLevel?: number;
  quote?: ReactNode;
  leadingAffordance?: ReactNode;
  contentOffsetX?: number;
  contentStyle?: CSSProperties;
  onContentPointerDown?: PointerEventHandler<HTMLDivElement>;
  onContentPointerMove?: PointerEventHandler<HTMLDivElement>;
  onContentPointerUp?: PointerEventHandler<HTMLDivElement>;
  onContentPointerCancel?: PointerEventHandler<HTMLDivElement>;
  onAction?: () => void;
  onMediaOpen?: () => void;
  onVoicePlay?: () => void;
  readStatusUpsell?: boolean;
  onReadStatusActivate?: () => void;
};

export function ChatBubble({
  children,
  kind = "text",
  direction = "incoming",
  text = "",
  title,
  description,
  avatar,
  timestamp,
  deliveryStatus = "sent",
  voiceDuration = 18,
  voiceState = "played",
  mediaSrc,
  mediaAlt = "",
  actionLabel,
  actionState = "default",
  actionDisabledReason,
  relationshipAvatars,
  relationshipLevel = 4,
  quote,
  leadingAffordance,
  contentOffsetX = 0,
  contentStyle,
  onContentPointerDown,
  onContentPointerMove,
  onContentPointerUp,
  onContentPointerCancel,
  onAction,
  onMediaOpen,
  onVoicePlay,
  readStatusUpsell = false,
  onReadStatusActivate,
}: ChatBubbleProps) {
  const avatarSlot = avatar ? (
    <span className="chatBubbleAvatar">{avatar}</span>
  ) : null;
  const columnStyle: CSSProperties = {
    ...contentStyle,
  };
  if (contentOffsetX && !columnStyle.transform) {
    columnStyle.transform = `translate3d(${contentOffsetX}px, 0, 0)`;
  }

  return (
    <div
      className={`chatBubble chatBubble--${direction} chatBubble--${kind}`}
      data-kind={kind}
      data-direction={direction}
      data-delivery-status={deliveryStatus}
      role="group"
      aria-label={`${direction === "incoming" ? "收到" : "发出"}的${
        kind === "text" ? "文字" : kind === "voice" ? "语音" : "消息"
      }`}
    >
      {direction === "incoming" ? avatarSlot : null}
      {direction === "outgoing" ? (
        <DeliveryIndicator status={deliveryStatus} />
      ) : null}
      {leadingAffordance}
      <div
        className="chatBubbleColumn"
        style={columnStyle}
        onPointerDown={onContentPointerDown}
        onPointerMove={onContentPointerMove}
        onPointerUp={onContentPointerUp}
        onPointerCancel={onContentPointerCancel}
      >
        {quote}
        <BubbleContent
          kind={kind}
          text={text}
          title={title}
          description={description}
          voiceDuration={voiceDuration}
          voiceState={voiceState}
          mediaSrc={mediaSrc}
          mediaAlt={mediaAlt}
          actionLabel={actionLabel}
          actionState={actionState}
          actionDisabledReason={actionDisabledReason}
          relationshipAvatars={relationshipAvatars}
          relationshipLevel={relationshipLevel}
          onAction={onAction}
          onMediaOpen={onMediaOpen}
          onVoicePlay={onVoicePlay}
        >
          {children}
        </BubbleContent>
        {readStatusUpsell &&
        direction === "outgoing" &&
        kind === "text" ? (
          <ReadStatusUpsell onActivate={onReadStatusActivate} />
        ) : null}
        {timestamp ? <time>{timestamp}</time> : null}
      </div>
      {direction === "incoming" &&
      kind === "voice" &&
      voiceState === "unread" ? (
        <span className="chatBubbleUnread" aria-label="未播放" />
      ) : null}
      {direction === "outgoing" ? avatarSlot : null}
    </div>
  );
}

export function ChatReplyPreview({
  direction = "outgoing",
  sender,
  kind = "text",
  text,
  status = "active",
  thumbnailSrc,
  imageAspect = "square",
  voiceDuration = 18,
  onLocate,
}: ChatReplyPreviewProps) {
  const unavailableText =
    status === "deleted"
      ? "This message has been deleted"
      : status === "recalled"
        ? "This message has been recalled"
        : status === "unavailable"
          ? "Quoted content is unavailable"
          : undefined;
  const disabled = status !== "active" || !onLocate;
  const accessibleText = unavailableText || text;

  return (
    <button
      className={`chatReplyPreview chatReplyPreview--${direction} chatReplyPreview--${kind} chatReplyPreview--${status}`}
      type="button"
      data-kind={kind}
      data-status={status}
      disabled={disabled}
      aria-label={
        status === "active"
          ? `定位到 ${sender} 的原消息：${text}`
          : accessibleText
      }
      onPointerDown={(event) => {
        // Don't let bubble swipe gesture capture quote taps.
        event.stopPropagation();
      }}
      onClick={onLocate}
    >
      <span className="chatReplyPreviewAccent" aria-hidden="true" />
      <span className="chatReplyPreviewBody">
        {status === "active" ? (
          <span className="chatReplyPreviewTitle">回复 {sender}</span>
        ) : null}
        <span className="chatReplyPreviewPayload">
          {unavailableText ? (
            <>
              <SystemIcon
                name="reply"
                size={20}
                className="chatReplyPreviewIcon"
              />
              <span>{unavailableText}</span>
            </>
          ) : kind === "image" || kind === "gif" ? (
            thumbnailSrc ? (
              <Image
                className={`chatReplyPreviewImage chatReplyPreviewImage--${imageAspect}`}
                src={thumbnailSrc}
                width={imageAspect === "portrait" ? 46 : 84}
                height={84}
                alt=""
                unoptimized
              />
            ) : (
              <span className="chatReplyPreviewImagePlaceholder" aria-hidden="true">
                IMG
              </span>
            )
          ) : (
            <>
              {kind === "link" ? (
                <SystemIcon
                  name="link"
                  size={20}
                  className="chatReplyPreviewIcon"
                />
              ) : null}
              {kind === "voice" ? (
                <SystemIcon
                  name="voice"
                  size={20}
                  className="chatReplyPreviewIcon"
                />
              ) : null}
              {isReplyPreviewMediaKind(kind) && thumbnailSrc ? (
                <Image
                  className="chatReplyPreviewThumbnail"
                  src={thumbnailSrc}
                  width={32}
                  height={32}
                  alt=""
                  unoptimized
                />
              ) : null}
              <span>
                {kind === "voice" ? `${voiceDuration}″` : text}
              </span>
            </>
          )}
        </span>
      </span>
    </button>
  );
}

function isReplyPreviewMediaKind(kind: ChatReplyPreviewKind) {
  return (
    kind === "game" ||
    kind === "gift" ||
    kind === "token" ||
    kind === "activity" ||
    kind === "groupGift"
  );
}

function ReadStatusUpsell({
  onActivate,
}: {
  onActivate?: () => void;
}) {
  return (
    <div className="chatBubbleReadStatusUpsell">
      <p className="chatBubbleReadStatusUpsellPrompt">
        Become member to see read status
      </p>
      <button
        className="chatBubbleReadStatusUpsellAction"
        type="button"
        disabled={!onActivate}
        title={!onActivate ? "会员开通暂不可用" : undefined}
        aria-label={
          onActivate
            ? "Activate membership to see read status"
            : "Activate membership to see read status，会员开通暂不可用"
        }
        onClick={onActivate}
      >
        <span>Activate</span>
        <SystemIcon name="chevronRight" size={12} />
      </button>
    </div>
  );
}

function DeliveryIndicator({
  status,
}: {
  status: ChatBubbleDeliveryStatus;
}) {
  if (status === "sent") return null;

  return (
    <span
      className={`chatBubbleDelivery chatBubbleDelivery--${status}`}
      role="status"
      aria-label={status === "sending" ? "消息发送中" : "消息发送失败"}
    >
      {status === "sending" ? (
        <SystemIcon name="loading" size={20} />
      ) : (
        <SystemIcon name="messageFailed" size={24} />
      )}
    </span>
  );
}

function BubbleContent({
  kind,
  text,
  title,
  description,
  voiceDuration = 18,
  voiceState = "played",
  mediaSrc,
  mediaAlt = "",
  actionLabel,
  actionState = "default",
  actionDisabledReason,
  relationshipAvatars,
  relationshipLevel = 4,
  onAction,
  onMediaOpen,
  onVoicePlay,
  children,
}: Omit<
  ChatBubbleProps,
  "avatar" | "timestamp" | "deliveryStatus" | "kind" | "direction"
> & {
  kind: ChatBubbleKind;
}) {
  if (kind === "voice") {
    const content = (
      <>
        <SystemIcon name="voice" />
        <span>{voiceDuration}″</span>
        {voiceState === "playing" ? (
          <span className="chatBubbleVoicePlaying" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        ) : null}
      </>
    );

    return onVoicePlay ? (
      <button
        className="chatBubbleSurface chatBubbleVoice"
        type="button"
        aria-label={`${voiceState === "playing" ? "暂停" : "播放"}语音消息，${voiceDuration} 秒`}
        aria-pressed={voiceState === "playing"}
        onClick={onVoicePlay}
      >
        {content}
      </button>
    ) : (
      <div className="chatBubbleSurface chatBubbleVoice">{content}</div>
    );
  }

  if (kind === "image") {
    const media = mediaSrc ? (
      <Image
        src={mediaSrc}
        alt={mediaAlt}
        width={202}
        height={202}
        unoptimized
      />
    ) : (
      <span className="chatBubbleMediaPlaceholder" aria-label={mediaAlt}>
        <span aria-hidden="true">IMG</span>
      </span>
    );

    return onMediaOpen ? (
      <button
        className="chatBubbleSurface chatBubbleMedia"
        type="button"
        aria-label={mediaAlt ? `查看图片：${mediaAlt}` : "查看图片"}
        onClick={onMediaOpen}
      >
        {media}
      </button>
    ) : (
      <div className="chatBubbleSurface chatBubbleMedia">{media}</div>
    );
  }

  if (kind === "gift") {
    return (
      <div className="chatBubbleSurface chatBubbleCard chatBubbleGift">
        <span className="chatBubbleGiftMedia" aria-hidden="true">
          <Image
            src={mediaSrc || "/prototypes/chat-bubble/outfit-gift.png"}
            alt=""
            width={140}
            height={100}
            unoptimized
          />
        </span>
        <p>{text || "送了你一个装扮"}</p>
        <span className="chatBubbleDivider" aria-hidden="true" />
        <BubbleAction
          label={actionLabel || "Check out"}
          state={actionState}
          disabledReason={actionDisabledReason}
          onAction={onAction}
        />
      </div>
    );
  }

  if (kind === "action") {
    return (
      <div className="chatBubbleSurface chatBubbleCard chatBubbleActionCard">
        <p>{text}</p>
        <span className="chatBubbleDivider" aria-hidden="true" />
        <BubbleAction
          label={actionLabel || "Go check"}
          state={actionState}
          disabledReason={actionDisabledReason}
          onAction={onAction}
        />
      </div>
    );
  }

  if (kind === "article") {
    return (
      <div className="chatBubbleSurface chatBubbleCard chatBubbleArticle">
        <strong>{title || "Assistant lectures | how to send the first note"}</strong>
        <p>{description || text}</p>
      </div>
    );
  }

  if (kind === "relationship") {
    const content = (
      <>
        <span className="chatBubbleRelationshipAvatars">
          <span className="chatBubbleRelationshipAvatarPair">
            {relationshipAvatars}
          </span>
          <span
            className="chatBubbleRelationshipTag"
            aria-label={`CP 关系等级 ${relationshipLevel}`}
          >
            <Image
              src="/icons/product/cp-heart.png"
              alt=""
              width={16}
              height={16}
              aria-hidden="true"
            />
            <span>IV{relationshipLevel}</span>
          </span>
        </span>
        <span className="chatBubbleRelationshipCopy">
          <strong>{title || "we become CP!"}</strong>
          {description ? <small>{description}</small> : null}
        </span>
        <SystemIcon name="chevronRight" size={20} />
      </>
    );

    return onAction ? (
      <button
        className="chatBubbleSurface chatBubbleRelationship"
        type="button"
        onClick={onAction}
      >
        {content}
      </button>
    ) : (
      <div className="chatBubbleSurface chatBubbleRelationship">{content}</div>
    );
  }

  return (
    <div className="chatBubbleSurface chatBubbleText">
      {children || <p>{text}</p>}
    </div>
  );
}

function BubbleAction({
  label,
  state,
  disabledReason,
  onAction,
}: {
  label: string;
  state: ChatBubbleActionState;
  disabledReason?: string;
  onAction?: () => void;
}) {
  const disabled =
    !onAction ||
    state === "disabled" ||
    state === "loading" ||
    state === "expired";
  const resolvedDisabledReason =
    disabledReason || (!onAction ? "操作暂不可用" : undefined);
  const renderedLabel =
    state === "loading"
      ? "Loading…"
      : state === "expired"
        ? "Expired"
        : label;

  return (
    <button
      className={`chatBubbleAction chatBubbleAction--${state}`}
      type="button"
      disabled={disabled}
      title={disabled ? resolvedDisabledReason : undefined}
      aria-label={
        disabled && resolvedDisabledReason
          ? `${renderedLabel}，${resolvedDisabledReason}`
          : renderedLabel
      }
      onClick={onAction}
    >
      {state === "loading" ? <SystemIcon name="loading" size={16} /> : null}
      <span>{renderedLabel}</span>
    </button>
  );
}
