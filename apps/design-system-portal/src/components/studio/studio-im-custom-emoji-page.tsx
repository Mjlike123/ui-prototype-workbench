"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { ChatBubble } from "@/components/kit/chat-bubble";
import { ChatInput } from "@/components/kit/chat-input";
import { ChatEmojiGifComposerStack } from "@/components/kit/chat-emoji-gif-composer-stack";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { SystemIcon } from "@/components/kit/system-icon";
import { StudioCustomEmojiPanel } from "@/components/studio/studio-custom-emoji-panel";
import {
  createStudioCustomEmoji,
  loadStudioCustomEmojis,
  loadStudioRecentEmojis,
  pushStudioRecentEmoji,
  saveStudioCustomEmojis,
  saveStudioRecentEmojis,
  type StudioCustomEmojiItem,
  type StudioEmojiSelection,
} from "@/lib/studio-im-custom-emoji-session";

const OUTGOING_AVATAR = "/icons/list/message-avatar.png";

type StudioImCustomEmojiPageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

type StudioChatMessage = {
  id: string;
  direction: "incoming" | "outgoing";
  kind: "text" | "emoji";
  text: string;
  mediaSrc?: string;
  time: string;
};

const FRIEND = {
  name: "Andrew",
  avatar: "/prototypes/feed/andrew-avatar.png",
};

const INITIAL_MESSAGES: StudioChatMessage[] = [
  {
    id: "m1",
    direction: "incoming",
    kind: "text",
    text: "Send me your new sticker pack 🎉",
    time: "9:38",
  },
  {
    id: "m2",
    direction: "outgoing",
    kind: "text",
    text: "Sure — adding one now.",
    time: "9:39",
  },
];

export function StudioImCustomEmojiPage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: StudioImCustomEmojiPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLElement>(null);
  const sequence = useRef(INITIAL_MESSAGES.length + 1);

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("hello😊😊😊");
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(true);
  const [recentEmojis, setRecentEmojis] = useState<StudioEmojiSelection[]>(
    () => loadStudioRecentEmojis(),
  );
  const [customEmojis, setCustomEmojis] = useState<StudioCustomEmojiItem[]>(
    () => loadStudioCustomEmojis(),
  );
  const [feedback, setFeedback] = useState("");
  const [uploadPreview, setUploadPreview] = useState<{
    src: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 3200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    saveStudioCustomEmojis(customEmojis);
  }, [customEmojis]);

  useEffect(() => {
    saveStudioRecentEmojis(recentEmojis);
  }, [recentEmojis]);

  useEffect(() => {
    const list = messageListRef.current;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, emojiPanelOpen]);

  const appendMessage = (
    text: string,
    kind: StudioChatMessage["kind"] = "text",
    mediaSrc?: string,
  ) => {
    setMessages((current) => [
      ...current,
      {
        id: `chat-${sequence.current++}`,
        direction: "outgoing",
        kind,
        text,
        mediaSrc,
        time: "Now",
      },
    ]);
  };

  const trimDraftCharacter = () => {
    setDraft((current) => {
      const segments = [...new Intl.Segmenter().segment(current)].map(
        (part) => part.segment,
      );
      return segments.slice(0, -1).join("");
    });
  };

  const sendEmojiSelection = (selection: StudioEmojiSelection) => {
    setRecentEmojis((current) => pushStudioRecentEmoji(current, selection));
    if (selection.type === "unicode") {
      setDraft((current) => `${current}${selection.value}`);
      setFeedback(`已插入 ${selection.label}`);
      return;
    }
    appendMessage(selection.label, "emoji", selection.src);
    setEmojiPanelOpen(false);
    setFeedback(`已发送 ${selection.label}`);
  };

  const sendMessage = (text: string) => {
    appendMessage(text);
    setDraft("");
    setEmojiPanelOpen(false);
    setFeedback("消息已发送");
  };

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) {
      setFeedback("请选择图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const baseName = file.name.replace(/\.[^.]+$/, "").slice(0, 24);
      setUploadPreview({
        src: reader.result,
        name: baseName || "My sticker",
      });
    };
    reader.readAsDataURL(file);
  };

  const confirmUpload = () => {
    if (!uploadPreview) return;

    const item = createStudioCustomEmoji({
      label: uploadPreview.name.trim() || "My sticker",
      src: uploadPreview.src,
    });

    setCustomEmojis((current) => [...current, item]);
    setUploadPreview(null);
    setFeedback("图片表情已添加，处理完成后可发送");

    window.setTimeout(() => {
      setCustomEmojis((current) =>
        current.map((emoji) =>
          emoji.id === item.id ? { ...emoji, status: "active" } : emoji,
        ),
      );
      setFeedback(`${item.label} 已可使用`);
    }, 900);
  };

  return (
    <div
      className={`pageCanvasDevice privateChatDevice studioImCustomEmojiDevice${
        emojiPanelOpen ? " hasEmojiPanelOpen" : ""
      }`}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Studio IM 自定义表情 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell">
        <header className="privateChatNavigation">
          <button type="button" aria-label="返回" onClick={onBack}>
            <SystemIcon name="back" />
          </button>
          <div className="privateChatIdentity">
            <h1>{FRIEND.name}</h1>
            <span className="privateChatPresence">
              <i aria-hidden="true" />
              Active now
            </span>
          </div>
          <button
            type="button"
            aria-label="私聊更多操作"
            onClick={() => setFeedback("Studio：更多私聊设置待探索")}
          >
            <SystemIcon name="more" />
          </button>
        </header>

        <main
          className="privateChatScroll studioImMessageList"
          aria-label={`与 ${FRIEND.name} 的消息`}
          ref={messageListRef}
        >
          <div className="privateChatDate">Today</div>
          {messages.map((message) => (
            <article
              key={message.id}
              className={`privateChatMessage privateChatMessage--kit privateChatMessage--${message.direction}`}
              aria-label={`${message.direction === "incoming" ? FRIEND.name : "You"} 的消息，${message.time}`}
            >
              <div className="privateChatMessageColumn">
                <ChatBubble
                  kind="text"
                  direction={message.direction}
                  text={message.kind === "emoji" ? "" : message.text}
                  timestamp={message.time}
                  avatar={
                    message.direction === "incoming" ? (
                      <AvatarVisual size={30} src={FRIEND.avatar} alt="" />
                    ) : (
                      <AvatarVisual size={30} src={OUTGOING_AVATAR} alt="" />
                    )
                  }
                >
                  {message.kind === "emoji" && message.mediaSrc ? (
                    <span
                      className="prototypeMessageSticker"
                      role="img"
                      aria-label={message.text}
                    >
                      <Image
                        src={message.mediaSrc}
                        alt=""
                        width={96}
                        height={96}
                        unoptimized
                      />
                    </span>
                  ) : undefined}
                </ChatBubble>
              </div>
            </article>
          ))}
        </main>

        <ChatEmojiGifComposerStack
          className="privateChatComposerStack studioImComposerStack"
          open={emojiPanelOpen}
          panel={
            <StudioCustomEmojiPanel
              recent={recentEmojis}
              customEmojis={customEmojis}
              onSelect={sendEmojiSelection}
              onAddImageRequest={openImagePicker}
              onDelete={trimDraftCharacter}
            />
          }
          input={
            <ChatInput
              value={draft}
              aria-label="发送私聊消息"
              onChange={setDraft}
              onSubmit={sendMessage}
              onEmoji={() => setEmojiPanelOpen((open) => !open)}
              onPhoto={() => {
                setFeedback("Studio：相册入口待探索");
              }}
              onGame={() => setFeedback("Studio：游戏入口待探索")}
              onGift={() => setFeedback("Studio：礼物入口待探索")}
            />
          }
        />

        {feedback ? (
          <output className="privateChatFeedback" aria-live="polite">
            {feedback}
          </output>
        ) : null}
        <div className="privateChatSafeArea" aria-hidden="true" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="visuallyHidden"
        aria-hidden="true"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      {uploadPreview ? (
        <div className="feedComposeOverlay" role="presentation">
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="取消添加图片表情"
            onClick={() => setUploadPreview(null)}
          />
          <section
            className="feedComposeMediaSheet studioImEmojiUploadSheet"
            aria-label="添加图片表情"
          >
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
            <header className="feedComposeMediaSheetHeader">
              <h2>添加图片表情</h2>
              <p>128×128 推荐 · PNG / WebP · 不超过 256KB</p>
            </header>
            <div className="studioImEmojiUploadPreview">
              <Image
                src={uploadPreview.src}
                alt=""
                width={128}
                height={128}
              />
              <label className="studioImEmojiUploadName">
                <span>名称</span>
                <input
                  type="text"
                  value={uploadPreview.name}
                  maxLength={32}
                  onChange={(event) =>
                    setUploadPreview((current) =>
                      current
                        ? { ...current, name: event.target.value }
                        : current,
                    )
                  }
                />
              </label>
            </div>
            <div className="feedComposePermissionActions">
              <button
                type="button"
                className="feedComposePermissionPrimary"
                onClick={confirmUpload}
              >
                添加到 Custom
              </button>
              <button
                type="button"
                className="feedComposePermissionSecondary"
                onClick={() => setUploadPreview(null)}
              >
                取消
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
