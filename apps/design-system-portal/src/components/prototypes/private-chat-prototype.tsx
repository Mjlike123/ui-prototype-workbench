"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import {
  ChatInput,
  type ChatInputMode,
} from "@/components/kit/chat-input";
import {
  ChatBubble,
  type ChatBubbleActionState,
  type ChatBubbleDeliveryStatus,
  type ChatBubbleKind,
  type ChatBubbleVoiceState,
} from "@/components/kit/chat-bubble";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { SystemIcon } from "@/components/kit/system-icon";
import {
  PrototypeChatSystemEvent,
  PrototypeMessageActionMenu,
  PrototypeMessagePayload,
  PrototypeMessageQuote,
  PrototypeReplyContextBar,
  type PrototypeMessageKind,
  type PrototypeMessageMenuAction,
  type PrototypeMessageStatus,
  type PrototypeQuote,
  type PrototypeReplyTarget,
} from "./prototype-chat-reply";
import { PrivateChatSwipeReplyShell } from "./private-chat-swipe-reply";
import {
  DEFAULT_CUSTOM_EMOJIS,
  PrototypeEmojiPanel,
  pushRecentEmoji,
  type CustomEmojiItem,
  type EmojiSelection,
} from "./prototype-emoji-panel";

/** Matches Figma exit keyframes 1199→1411.26ms. */
const MESSAGE_MENU_EXIT_MS = 212;
/** Figma 298:9970 enter/exit segment ≈ 406ms spring lift. */
const MESSAGE_MENU_LIFT_MS = 406;

export type PrivateChatFriend = {
  id: string;
  name: string;
  avatar: string;
};

type ChatMessage = {
  id: string;
  direction: "incoming" | "outgoing";
  sender: string;
  kind: PrototypeMessageKind | Exclude<ChatBubbleKind, PrototypeMessageKind>;
  text: string;
  title?: string;
  description?: string;
  mediaSrc?: string;
  actionLabel?: string;
  actionState?: ChatBubbleActionState;
  deliveryStatus?: ChatBubbleDeliveryStatus;
  voiceState?: ChatBubbleVoiceState;
  time: string;
  status: PrototypeMessageStatus;
  quote?: PrototypeQuote;
};

const initialMessages: ChatMessage[] = [
  {
    id: "chat-1",
    direction: "incoming",
    sender: "Alice",
    kind: "text",
    text: "Is the UI review still happening tomorrow?",
    time: "14:23",
    status: "active",
  },
  {
    id: "chat-2",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "Yes — I’ve already sent the first draft.",
    time: "14:24",
    status: "active",
    deliveryStatus: "sending",
  },
  {
    id: "chat-3",
    direction: "incoming",
    sender: "Alice",
    kind: "image",
    text: "Ocean color reference",
    mediaSrc: "/prototypes/chat-reply/photo-square.png",
    time: "14:25",
    status: "active",
  },
  {
    id: "chat-4",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "This color direction works. The details feel clearer.",
    time: "14:26",
    status: "active",
    quote: {
      id: "chat-3",
      sourceId: "chat-3",
      sender: "Alice",
      kind: "image",
      preview: "Ocean color reference",
      status: "active",
    },
  },
  {
    id: "chat-5",
    direction: "incoming",
    sender: "Alice",
    kind: "voice",
    text: "Voice message",
    time: "14:27",
    status: "active",
    voiceState: "unread",
  },
  {
    id: "chat-6",
    direction: "outgoing",
    sender: "You",
    kind: "emoji",
    text: "Celebration",
    mediaSrc: "/prototypes/chat-reply/sticker.png",
    time: "14:28",
    status: "active",
    quote: {
      id: "chat-5",
      sourceId: "chat-5",
      sender: "Alice",
      kind: "voice",
      preview: "Voice message",
      status: "active",
    },
  },
  {
    id: "chat-7",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "I’ll send the revised version tonight.",
    time: "14:29",
    status: "active",
    deliveryStatus: "failed",
  },
  {
    id: "chat-8",
    direction: "incoming",
    sender: "Alice",
    kind: "gift",
    text: "送了你一个装扮",
    time: "14:30",
    status: "active",
    actionLabel: "Check out",
    actionState: "expired",
  },
  {
    id: "chat-9",
    direction: "incoming",
    sender: "Alice",
    kind: "action",
    text: "Your current VIP level is halfway through its validity period.",
    time: "14:31",
    status: "active",
    actionLabel: "Go check",
  },
  {
    id: "chat-10",
    direction: "incoming",
    sender: "Alice",
    kind: "article",
    title: "Assistant lectures | how to send the first note",
    description: "A short guide with practical steps for starting a conversation.",
    text: "A short guide with practical steps for starting a conversation.",
    time: "14:32",
    status: "active",
  },
  {
    id: "chat-11",
    direction: "incoming",
    sender: "Alice",
    kind: "relationship",
    title: "we become CP!",
    text: "we become CP!",
    time: "14:33",
    status: "active",
  },
  {
    id: "chat-12",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "That looks fun — send me the room link.",
    time: "14:34",
    status: "active",
    quote: {
      id: "chat-9",
      sourceId: "chat-9",
      sender: "Alice",
      kind: "game",
      preview: "Invites you to play Clash Royale",
      status: "active",
      thumbnailSrc: "/prototypes/chat-reply/game.png",
    },
  },
  {
    id: "chat-13",
    direction: "incoming",
    sender: "Alice",
    kind: "text",
    text: "The event starts this weekend.",
    time: "14:35",
    status: "active",
    quote: {
      id: "chat-10",
      sourceId: "chat-10",
      sender: "You",
      kind: "link",
      preview: "Assistant lectures | how to send the first note",
      status: "active",
    },
  },
  {
    id: "chat-14",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "I’ll join after the review.",
    time: "14:36",
    status: "active",
    quote: {
      id: "chat-10",
      sourceId: "chat-10",
      sender: "Alice",
      kind: "activity",
      preview: "TopTop weekend event",
      status: "active",
      thumbnailSrc: "/prototypes/chat-reply/activity-wide.png",
    },
  },
  {
    id: "chat-15",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "Thank you for the gift!",
    time: "14:37",
    status: "active",
    quote: {
      id: "chat-8",
      sourceId: "chat-8",
      sender: "Alice",
      kind: "gift",
      preview: "Sent you an outfit",
      status: "active",
      thumbnailSrc: "/prototypes/chat-reply/gift.png",
    },
  },
  {
    id: "chat-16",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "I remember what you meant.",
    time: "14:38",
    status: "active",
    quote: {
      id: "missing-message",
      sourceId: "missing-message",
      sender: "Alice",
      kind: "text",
      preview: "Unavailable content",
      status: "unavailable",
    },
  },
  {
    id: "chat-17",
    direction: "outgoing",
    sender: "You",
    kind: "text",
    text: "This crop works better.",
    time: "14:39",
    status: "active",
    quote: {
      id: "chat-3",
      sourceId: "chat-3",
      sender: "Alice",
      kind: "image",
      preview: "Portrait photo",
      status: "active",
      thumbnailSrc: "/prototypes/chat-reply/photo-portrait.png",
      imageAspect: "portrait",
    },
  },
];

export function PrivateChatPrototype({
  friend,
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: {
  friend: PrivateChatFriend;
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [inputMode, setInputMode] = useState<ChatInputMode>("text");
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState<EmojiSelection[]>([]);
  const [customEmojis, setCustomEmojis] =
    useState<CustomEmojiItem[]>(DEFAULT_CUSTOM_EMOJIS);
  const [replyingTo, setReplyingTo] = useState<PrototypeReplyTarget>();
  const [menuMessageId, setMenuMessageId] = useState<string>();
  const [menuClosing, setMenuClosing] = useState(false);
  const [menuLiftPx, setMenuLiftPx] = useState(0);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string>();
  const [feedback, setFeedback] = useState(
    "右滑气泡可回复，长按打开更多操作",
  );
  const sequence = useRef(initialMessages.length + 1);
  const deviceRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLElement>(null);
  const messageRefs = useRef(new Map<string, HTMLElement>());
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const menuExitTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const menuLiftRaf = useRef<number | undefined>(undefined);
  const menuLiftApplied = useRef(0);
  const restoreFocusOnMenuClose = useRef(true);

  useEffect(
    () => () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (highlightTimer.current) clearTimeout(highlightTimer.current);
      if (menuExitTimer.current) clearTimeout(menuExitTimer.current);
      if (menuLiftRaf.current != null) cancelAnimationFrame(menuLiftRaf.current);
    },
    [],
  );

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(""), 3200);
    return () => clearTimeout(timer);
  }, [feedback]);

  useLayoutEffect(() => {
    if (!menuMessageId || menuClosing) return;
    const list = messageListRef.current;
    const messageEl = messageRefs.current.get(menuMessageId);
    if (!list || !messageEl) return;

    const menu = messageEl.querySelector<HTMLElement>(".prototypeMessageMenu");
    if (!menu) return;

    const listRect = list.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const messageRect = messageEl.getBoundingClientRect();
    const padding = 12;

    if (listRect.height <= 0 || menuRect.height <= 0) return;

    // Bottom-clipped menu (Figma 298:9970): spring-lift the message upward.
    if (menuRect.bottom <= listRect.bottom - padding) {
      setMenuLiftPx(0);
      menuLiftApplied.current = 0;
      return;
    }

    const overflow = menuRect.bottom - (listRect.bottom - padding);
    const maxLift = Math.max(
      overflow,
      messageRect.top - listRect.top + messageRect.height * 0.35,
    );
    const neededLift = Math.min(Math.ceil(overflow), Math.ceil(maxLift));
    if (neededLift <= 0) {
      setMenuLiftPx(0);
      menuLiftApplied.current = 0;
      return;
    }

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (menuLiftRaf.current != null) cancelAnimationFrame(menuLiftRaf.current);

    if (reduceMotion) {
      setMenuLiftPx(neededLift);
      menuLiftApplied.current = neededLift;
      return;
    }

    // Start at 0 so the Figma spring transition can run to the target lift.
    setMenuLiftPx(0);
    menuLiftApplied.current = 0;
    menuLiftRaf.current = requestAnimationFrame(() => {
      menuLiftRaf.current = requestAnimationFrame(() => {
        setMenuLiftPx(neededLift);
        menuLiftApplied.current = neededLift;
        menuLiftRaf.current = undefined;
      });
    });

    return () => {
      if (menuLiftRaf.current != null) {
        cancelAnimationFrame(menuLiftRaf.current);
        menuLiftRaf.current = undefined;
      }
    };
  }, [menuMessageId, menuClosing]);

  const appendMessage = (
    text: string,
    kind: PrototypeMessageKind = "text",
    mediaSrc?: string,
  ) => {
    if (!text) return;
    const quote = replyingTo
      ? { ...replyingTo, sourceId: replyingTo.id }
      : undefined;
    setMessages((current) => [
      ...current,
      {
        id: `chat-${sequence.current++}`,
        direction: "outgoing",
        sender: "You",
        kind,
        text,
        mediaSrc,
        time: "Now",
        status: "active",
        quote,
      },
    ]);
    setReplyingTo(undefined);
    setFeedback(quote ? "回复已发送" : "消息已发送");
  };

  const sendEmojiSelection = (selection: EmojiSelection) => {
    setRecentEmojis((current) => pushRecentEmoji(current, selection));
    if (selection.type === "unicode") {
      setDraft((current) => `${current}${selection.value}`);
      setFeedback(`已插入 ${selection.label}`);
      return;
    }
    appendMessage(selection.label, "emoji", selection.src);
    setEmojiPanelOpen(false);
    scrollToLatestMessage();
  };

  const requestCustomEmojiUpload = () => {
    const pendingId = `pending-${Date.now()}`;
    setCustomEmojis((current) => [
      ...current,
      {
        id: pendingId,
        label: "New sticker",
        src: "/prototypes/profile-v3/supporter-card.png",
        status: "pending",
      },
    ]);
    setFeedback("已提交审核，通过后可在 Custom 使用");
  };

  const sendMessage = (text: string) => {
    appendMessage(text);
    setDraft("");
    setEmojiPanelOpen(false);
  };

  const clearMenuExitTimer = () => {
    if (!menuExitTimer.current) return;
    clearTimeout(menuExitTimer.current);
    menuExitTimer.current = undefined;
  };

  const finishMenuClose = () => {
    const messageId = menuMessageId;
    const restoreFocus = restoreFocusOnMenuClose.current;
    clearMenuExitTimer();
    setMenuClosing(false);
    setMenuMessageId(undefined);
    setMenuLiftPx(0);
    menuLiftApplied.current = 0;
    if (!restoreFocus || !messageId) return;
    requestAnimationFrame(() => messageRefs.current.get(messageId)?.focus());
  };

  const openMenu = (messageId: string) => {
    clearMenuExitTimer();
    setMenuClosing(false);
    setMenuLiftPx(0);
    menuLiftApplied.current = 0;
    restoreFocusOnMenuClose.current = true;
    setMenuMessageId(messageId);
    setFeedback("已打开消息操作菜单");
  };

  const dismissMenu = (restoreFocus = true) => {
    if (!menuMessageId || menuClosing) return;
    restoreFocusOnMenuClose.current = restoreFocus;
    if (
      typeof window !== "undefined" &&
      (typeof window.matchMedia !== "function" ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      finishMenuClose();
      return;
    }
    const hadLift = menuLiftApplied.current > 0 || menuLiftPx > 0;
    setMenuClosing(true);
    // Spring the lifted message back down (Figma 298:9970 exit segment).
    setMenuLiftPx(0);
    clearMenuExitTimer();
    menuExitTimer.current = setTimeout(
      finishMenuClose,
      Math.max(MESSAGE_MENU_EXIT_MS, hadLift ? MESSAGE_MENU_LIFT_MS : 0) + 40,
    );
  };

  const clearLongPress = () => {
    if (!longPressTimer.current) return;
    clearTimeout(longPressTimer.current);
    longPressTimer.current = undefined;
  };

  const startLongPress = (
    event: PointerEvent<HTMLElement>,
    messageId: string,
  ) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearLongPress();
    longPressTimer.current = setTimeout(() => openMenu(messageId), 520);
  };

  const startReply = (message: ChatMessage) => {
    if (!isReplyableKind(message.kind)) return;
    setReplyingTo(toReplyTarget(message));
    setInputMode("text");
    dismissMenu(false);
    setFeedback(`正在回复 ${message.sender}`);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLTextAreaElement>(".privateChatDevice textarea")
        ?.focus(),
    );
  };

  const updateMessageStatus = (
    messageId: string,
    status: PrototypeMessageStatus,
  ) => {
    setMessages((current) =>
      current.map((message) =>
        message.id === messageId ? { ...message, status } : message,
      ),
    );
    setReplyingTo((current) =>
      current?.id === messageId ? undefined : current,
    );
  };

  const handleMenuAction = (
    message: ChatMessage,
    action: PrototypeMessageMenuAction,
  ) => {
    if (action === "reply") return startReply(message);
    dismissMenu(false);
    if (action === "copy") {
      void navigator.clipboard?.writeText(message.text);
      setFeedback("消息已复制");
      return;
    }
    if (action === "report") {
      setFeedback("举报已提交，我们会尽快处理");
      return;
    }
    if (action === "recall") {
      updateMessageStatus(message.id, "recalled");
      setFeedback("消息已撤回");
      return;
    }
    updateMessageStatus(message.id, "deleted");
    setFeedback("消息已删除");
  };

  const locateOriginal = (sourceId: string) => {
    const source = messages.find((message) => message.id === sourceId);
    if (!source || source.status !== "active") return;
    messageRefs.current.get(sourceId)?.scrollIntoView?.({
      block: "start",
      behavior: "smooth",
    });
    setHighlightedMessageId(sourceId);
    setFeedback(`已定位到 ${source.sender} 的原消息`);
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    highlightTimer.current = setTimeout(
      () => setHighlightedMessageId(undefined),
      1800,
    );
  };

  const latestReadOutgoingMessageId = [...messages]
    .reverse()
    .find(
      (message) =>
        message.direction === "outgoing" &&
        message.status === "active" &&
        message.deliveryStatus !== "sending" &&
        message.deliveryStatus !== "failed",
    )?.id;

  const scrollToLatestMessage = () => {
    const messageList = messageListRef.current;
    messageList?.scrollTo?.({
      top: messageList.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div
      ref={deviceRef}
      className={`pageCanvasDevice privateChatDevice${
        menuMessageId ? " hasMessageMenu" : ""
      }${menuClosing ? " isMessageMenuExiting" : ""}`}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`与 ${friend.name} 私聊原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />
      <div className="pageCanvasContentShell">
        <header className="privateChatNavigation">
          <button type="button" aria-label="返回 Message" onClick={onBack}>
            <SystemIcon name="back" />
          </button>
          <div className="privateChatIdentity">
            <h1>{friend.name}</h1>
            <span className="privateChatPresence">
              <i aria-hidden="true" />
              Active now
            </span>
          </div>
          <button
            type="button"
            aria-label="私聊更多操作"
            onClick={() => setFeedback("更多私聊设置将在正式产品中提供")}
          >
            <SystemIcon name="more" />
          </button>
        </header>

        <main
          ref={messageListRef}
          className="privateChatScroll"
          aria-label={`与 ${friend.name} 的消息`}
        >
          <div className="privateChatDate">Today</div>
          <p className="privateChatHint">右滑气泡回复 · 长按打开菜单 · 点击引用定位</p>
          {messages.map((message) => {
            const quote: PrototypeQuote | undefined = message.quote
              ? {
                  ...message.quote,
                  status:
                    message.quote.status === "unavailable"
                      ? "unavailable"
                      : messages.find(
                          (candidate) =>
                            candidate.id === message.quote?.sourceId,
                        )?.status ?? "deleted",
                }
              : undefined;
            const menuOpen = menuMessageId === message.id;
            const supportsMenu =
              message.status === "active" && isReplyableKind(message.kind);
            const bubbleKind: ChatBubbleKind =
              message.status !== "active" || message.kind === "emoji"
                ? "text"
                : message.kind;
            return (
              <article
                ref={(node) => {
                  if (node) messageRefs.current.set(message.id, node);
                  else messageRefs.current.delete(message.id);
                }}
                className={`privateChatMessage privateChatMessage--kit privateChatMessage--${message.direction}${
                  highlightedMessageId === message.id ? " isHighlighted" : ""
                }${menuOpen ? " isMenuOpen" : ""}${
                  message.kind === "relationship"
                    ? " privateChatMessage--relationship"
                    : ""
                }`}
                style={
                  menuOpen
                    ? ({
                        ["--private-chat-menu-lift" as string]: `${menuLiftPx}px`,
                      } satisfies CSSProperties)
                    : undefined
                }
                key={message.id}
                tabIndex={0}
                aria-label={`${message.sender} 的消息，${message.time}`}
                onPointerDown={(event) =>
                  supportsMenu && startLongPress(event, message.id)
                }
                onPointerUp={clearLongPress}
                onPointerCancel={clearLongPress}
                onPointerLeave={clearLongPress}
                onContextMenu={(event) => {
                  if (!supportsMenu) return;
                  event.preventDefault();
                  openMenu(message.id);
                }}
                onKeyDown={(event) => {
                  if (
                    supportsMenu &&
                    (event.key === "ContextMenu" ||
                      (event.shiftKey && event.key === "F10"))
                  ) {
                    event.preventDefault();
                    openMenu(message.id);
                  }
                }}
              >
                <div className="privateChatMessageColumn">
                  <PrivateChatSwipeReplyShell
                    enabled={supportsMenu && !menuOpen && !menuClosing}
                    axis={message.direction}
                    getEdgeGuardLeft={() =>
                      deviceRef.current?.getBoundingClientRect().left ?? 0
                    }
                    onTrackingStart={clearLongPress}
                    onCommit={() => startReply(message)}
                  >
                    {(swipe) => (
                      <ChatBubble
                        kind={bubbleKind}
                        direction={message.direction}
                        text={
                          message.status === "deleted"
                            ? "消息已删除"
                            : message.status === "recalled"
                              ? "该消息已被撤回"
                              : message.text
                        }
                        title={message.title}
                        description={message.description}
                        timestamp={
                          message.id === latestReadOutgoingMessageId
                            ? "已读"
                            : undefined
                        }
                        deliveryStatus={message.deliveryStatus}
                        voiceState={message.voiceState}
                        actionLabel={message.actionLabel}
                        actionState={message.actionState}
                        actionDisabledReason={
                          message.actionState === "expired"
                            ? "礼物已过期"
                            : undefined
                        }
                        mediaSrc={message.mediaSrc}
                        mediaAlt={message.text}
                        leadingAffordance={
                          supportsMenu ? swipe.leadingAffordance : undefined
                        }
                        contentStyle={
                          supportsMenu ? swipe.contentStyle : undefined
                        }
                        onContentPointerDown={
                          supportsMenu
                            ? swipe.handlers.onPointerDown
                            : undefined
                        }
                        onContentPointerMove={
                          supportsMenu
                            ? swipe.handlers.onPointerMove
                            : undefined
                        }
                        onContentPointerUp={
                          supportsMenu ? swipe.handlers.onPointerUp : undefined
                        }
                        onContentPointerCancel={
                          supportsMenu
                            ? swipe.handlers.onPointerCancel
                            : undefined
                        }
                        avatar={
                          message.kind === "relationship"
                            ? undefined
                            : message.direction === "incoming" ? (
                                <Image
                                  src={friend.avatar}
                                  alt=""
                                  width={30}
                                  height={30}
                                />
                              ) : (
                                <Image
                                  src="/icons/list/message-avatar.png"
                                  alt=""
                                  width={30}
                                  height={30}
                                />
                              )
                        }
                        relationshipAvatars={
                          message.kind === "relationship" ? (
                            <>
                              <Image
                                src={friend.avatar}
                                alt=""
                                width={40}
                                height={40}
                              />
                              <AvatarVisual size={40} alt="" />
                            </>
                          ) : undefined
                        }
                        quote={
                          quote ? (
                            <PrototypeMessageQuote
                              quote={quote}
                              direction={message.direction}
                              onLocate={locateOriginal}
                            />
                          ) : undefined
                        }
                        onVoicePlay={
                          message.kind === "voice"
                            ? () => setFeedback("正在播放语音消息")
                            : undefined
                        }
                        onMediaOpen={
                          message.kind === "image"
                            ? () => setFeedback("已打开图片预览")
                            : undefined
                        }
                        onAction={
                          message.kind === "gift" &&
                          message.actionState === "expired"
                            ? undefined
                            : message.kind === "action"
                              ? () => setFeedback("已打开会员权益")
                              : message.kind === "relationship"
                                ? () => setFeedback("已打开关系详情")
                                : undefined
                        }
                      >
                        {message.status === "active" &&
                        message.kind === "emoji" ? (
                          <PrototypeMessagePayload
                            kind={message.kind}
                            text={message.text}
                            mediaSrc={message.mediaSrc}
                          />
                        ) : undefined}
                      </ChatBubble>
                    )}
                  </PrivateChatSwipeReplyShell>
                  {menuOpen ? (
                    <PrototypeMessageActionMenu
                      direction={message.direction}
                      isExiting={menuClosing}
                      onAction={(action) =>
                        handleMenuAction(message, action)
                      }
                      onDismiss={() => dismissMenu()}
                      onExitComplete={finishMenuClose}
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
          <PrototypeChatSystemEvent text="You recalled a message" />
        </main>

        <div className="privateChatComposerStack">
          {replyingTo ? (
            <PrototypeReplyContextBar
              target={replyingTo}
              onClose={() => {
                setReplyingTo(undefined);
                setFeedback("已取消回复");
              }}
            />
          ) : null}
          {emojiPanelOpen ? (
            <PrototypeEmojiPanel
              recent={recentEmojis}
              customEmojis={customEmojis}
              onSelect={sendEmojiSelection}
              onUploadRequest={requestCustomEmojiUpload}
            />
          ) : null}
          <ChatInput
            value={draft}
            mode={inputMode}
            aria-label="发送私聊消息"
            onChange={setDraft}
            onSubmit={sendMessage}
            onFocus={() => {
              setEmojiPanelOpen(false);
              scrollToLatestMessage();
            }}
            onModeChange={setInputMode}
            onPhoto={() => appendMessage("Photo", "image")}
            onEmoji={() => setEmojiPanelOpen((open) => !open)}
            onGame={() => appendMessage("Game invite")}
            onGift={() => appendMessage("Gift")}
            onVoiceHoldEnd={() => appendMessage("Voice message", "voice")}
          />
        </div>
        {feedback ? (
          <output className="privateChatFeedback" aria-live="polite">
            {feedback}
          </output>
        ) : null}
        <div className="privateChatSafeArea" aria-hidden="true" />
      </div>
      {menuMessageId ? (
        <button
          className={`prototypeMessageMenuDismiss${
            menuClosing ? " isExiting" : ""
          }`}
          type="button"
          aria-label="关闭消息操作菜单"
          disabled={menuClosing}
          onClick={() => dismissMenu()}
        />
      ) : null}
    </div>
  );
}

function isReplyableKind(
  kind: ChatMessage["kind"],
): boolean {
  return (
    kind === "text" ||
    kind === "image" ||
    kind === "emoji" ||
    kind === "voice" ||
    kind === "gift" ||
    kind === "article" ||
    kind === "action"
  );
}

function toReplyTarget(message: ChatMessage): PrototypeReplyTarget {
  if (message.kind === "image") {
    return {
      id: message.id,
      sender: message.sender,
      kind: "image",
      preview: message.text,
      status: message.status,
      thumbnailSrc: message.mediaSrc || "/prototypes/chat-reply/photo-square.png",
    };
  }
  if (message.kind === "emoji") {
    return {
      id: message.id,
      sender: message.sender,
      kind: "emoji",
      preview: message.text,
      status: message.status,
      thumbnailSrc:
        message.mediaSrc || "/prototypes/chat-reply/sticker.png",
    };
  }
  if (message.kind === "voice") {
    return {
      id: message.id,
      sender: message.sender,
      kind: "voice",
      preview: message.text,
      status: message.status,
      voiceDuration: 18,
    };
  }
  if (message.kind === "gift") {
    return {
      id: message.id,
      sender: message.sender,
      kind: "gift",
      preview: message.text || "送了你一个装扮",
      status: message.status,
      thumbnailSrc: "/prototypes/chat-reply/gift.png",
    };
  }
  if (message.kind === "article") {
    return {
      id: message.id,
      sender: message.sender,
      kind: "link",
      preview: message.title || message.text,
      status: message.status,
    };
  }
  return {
    id: message.id,
    sender: message.sender,
    kind: "text",
    preview: message.text,
    status: message.status,
  };
}
