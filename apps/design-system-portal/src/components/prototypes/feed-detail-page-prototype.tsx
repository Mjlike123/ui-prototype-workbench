"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { ChatEmojiGifComposerStack } from "@/components/kit/chat-emoji-gif-composer-stack";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { ListTag } from "@/components/kit/list-tag";
import { SystemIcon } from "@/components/kit/system-icon";
import { TextSecondaryTab } from "@/components/kit/text-secondary-tab";
import {
  DEFAULT_CUSTOM_EMOJIS,
  PrototypeEmojiPanel,
  pushRecentEmoji,
  type EmojiSelection,
} from "@/components/prototypes/prototype-emoji-panel";

type FeedDetailPagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

type FeedDetailComment =
  | {
      id: string;
      kind: "text";
      author: string;
      avatar: string;
      text: string;
      time: string;
      badge?: "author";
      indent?: number;
    }
  | {
      id: string;
      kind: "deleted";
      author: string;
      avatar: string;
      time: string;
      indent?: number;
    }
  | {
      id: string;
      kind: "reply";
      author: string;
      avatar: string;
      text: string;
      placeholder?: string;
      time: string;
      indent?: number;
    }
  | {
      id: string;
      kind: "more-replies";
      label: string;
      indent?: number;
    };

const POST = {
  user: "Latifa Alghanim",
  avatar: "/prototypes/feed/latifa-avatar.png",
  flag: "/prototypes/feed/ukraine-flag.png",
  gender: "female" as const,
  age: 28,
  level: "N8",
  vip: 13 as const,
  leadHashtag: "#OOTD",
  caption:
    "I'm 180 cm tall. I enjoy fitness, swimming and delicious food. Do you have any friends with the same hobbies? Come and chat with me. We",
  trailingHashtags: ["#OOTD", "#While the sun is shining"],
  media: "/prototypes/feed/latifa-photo.png",
  time: "23 minutes ago",
  likes: "999",
  comments: "999",
};

const COMMENTS: FeedDetailComment[] = [
  {
    id: "c1",
    kind: "text",
    author: "Jane Cooper",
    avatar: "/prototypes/feed/andrew-avatar.png",
    text: "Beautiful dress, where did you buy it?",
    time: "3 minutes ago",
    badge: "author",
  },
  {
    id: "c2",
    kind: "reply",
    author: "Hamad Al Hafeet",
    avatar: "/prototypes/message/conversation-1.png",
    text: "She mentioned in her story it's from a boutique in Kuwait City.",
    time: "3 minutes ago",
    indent: 1,
  },
  {
    id: "c3",
    kind: "reply",
    author: "Obaid Al Marzouki",
    avatar: "/prototypes/message/conversation-2.png",
    text: "Thanks for the tip — I'll check that boutique this weekend.",
    time: "3 minutes ago",
    indent: 1,
  },
  {
    id: "c4",
    kind: "more-replies",
    label: "View more replies",
    indent: 1,
  },
];

const DETAIL_TABS = [
  { key: "comments", label: "Comments" },
  { key: "like", label: "Like" },
] as const;

/** Figma 856:69920 — 动态详情 */
export function FeedDetailPagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: FeedDetailPagePrototypeProps) {
  const [tab, setTab] = useState<(typeof DETAIL_TABS)[number]["key"]>("comments");
  const [followed, setFollowed] = useState(false);
  const [liked, setLiked] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [replyComposerActive, setReplyComposerActive] = useState(false);
  const [replyPanelOpen, setReplyPanelOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<EmojiSelection[]>([]);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 2400);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const openReplyComposer = (options?: { panel?: boolean }) => {
    const openPanel = options?.panel ?? false;
    setReplyComposerActive(true);
    setReplyPanelOpen(openPanel);
    window.requestAnimationFrame(() => {
      if (openPanel) {
        replyInputRef.current?.blur();
        return;
      }
      replyInputRef.current?.focus();
    });
  };

  const closeReplyPanel = () => {
    setReplyPanelOpen(false);
    window.requestAnimationFrame(() => replyInputRef.current?.focus());
  };

  const toggleReplyPanel = () => {
    if (replyPanelOpen) {
      closeReplyPanel();
      return;
    }
    replyInputRef.current?.blur();
    setReplyPanelOpen(true);
  };

  const closeReplyComposer = () => {
    setReplyComposerActive(false);
    setReplyPanelOpen(false);
    setReplyDraft("");
  };

  const sendEmojiSelection = (selection: EmojiSelection) => {
    setRecentEmojis((current) => pushRecentEmoji(current, selection));
    if (selection.type === "unicode") {
      setReplyDraft((current) => `${current}${selection.value}`);
      setFeedback(`已插入 ${selection.label}`);
      return;
    }
    setFeedback(`已发送 ${selection.label}`);
    closeReplyComposer();
  };

  const trimReplyDraftCharacter = () => {
    setReplyDraft((current) => {
      const segments = [...new Intl.Segmenter().segment(current)].map(
        (part) => part.segment,
      );
      return segments.slice(0, -1).join("");
    });
  };

  const sendReply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = replyDraft.trim();
    if (!text) return;
    setFeedback(`已回复 ${POST.user}：${text}`);
    closeReplyComposer();
  };

  return (
    <div
      className={[
        "pageCanvasDevice feedDetailDevice",
        replyPanelOpen ? "hasReplyPanelOpen" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`动态详情 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell">
        <header className="feedDetailNavigation">
          <button type="button" aria-label="返回" onClick={onBack}>
            <SystemIcon name="back" />
          </button>

          <div className="feedDetailAuthor">
            <AvatarVisual size={36} src={POST.avatar} alt="" />
            <div className="feedDetailIdentity">
              <strong>{POST.user}</strong>
              <span className="feedDetailTags" aria-label="用户标签">
                <Image src={POST.flag} alt="" width={24} height={14} />
                <ListTag kind="gender" gender={POST.gender} age={POST.age} />
                <Image
                  className="feedDetailLevel"
                  src="/prototypes/feed/n8-badge.png"
                  alt="N8"
                  width={36}
                  height={14}
                />
                <ListTag kind="membership" level={POST.vip} />
              </span>
            </div>
          </div>

          <div className="feedDetailNavActions">
            <button
              type="button"
              className="feedDetailFollow"
              aria-label={followed ? "取消关注" : "关注"}
              aria-pressed={followed}
              onClick={() => {
                setFollowed((current) => !current);
                setFeedback(followed ? "已取消关注" : "已关注");
              }}
            >
              <SystemIcon name={followed ? "followed" : "follow"} size={20} />
            </button>
            <button
              type="button"
              aria-label="更多操作"
              onClick={() => setFeedback("更多操作待接入")}
            >
              <SystemIcon name="more" />
            </button>
          </div>
        </header>

        <main className="feedDetailScroll" aria-label="动态详情内容">
          <article className="feedDetailPost" aria-label={`${POST.user} 的动态`}>
            <p className="feedDetailCaption">
              <mark>{POST.leadHashtag} </mark>
              {POST.caption}{" "}
              {POST.trailingHashtags.map((hashtag) => (
                <mark key={hashtag}>{hashtag} </mark>
              ))}
              <button type="button" onClick={() => setFeedback("展开全文")}>
                ...see more
              </button>
            </p>
            {POST.media ? (
              <div className="feedDetailMedia">
                <Image
                  src={POST.media}
                  alt={`${POST.user} 的动态照片`}
                  width={180}
                  height={180}
                />
              </div>
            ) : null}
            <time className="feedDetailTime">{POST.time}</time>
          </article>

          <TextSecondaryTab
            className="feedDetailTabs"
            ariaLabel="动态详情分区"
            items={DETAIL_TABS}
            value={tab}
            onChange={(key) =>
              setTab(key as (typeof DETAIL_TABS)[number]["key"])
            }
          />

          {tab === "comments" ? (
            <section className="feedDetailComments" aria-label="评论列表">
              {COMMENTS.map((comment) => (
                <FeedDetailCommentRow
                  key={comment.id}
                  comment={comment}
                  onReply={() => {
                    openReplyComposer();
                    setFeedback(`回复 ${commentAuthor(comment)}`);
                  }}
                  onMoreReplies={() => setFeedback("展开更多回复")}
                />
              ))}
            </section>
          ) : (
            <p className="feedDetailEmptyTab">Like list coming soon</p>
          )}
        </main>

        <ChatEmojiGifComposerStack
          className="feedDetailComposerStack"
          open={replyPanelOpen}
          panel={
            <PrototypeEmojiPanel
              recent={recentEmojis}
              customEmojis={DEFAULT_CUSTOM_EMOJIS}
              onSelect={sendEmojiSelection}
              onUploadRequest={() => setFeedback("自定义表情待接入")}
              onDelete={trimReplyDraftCharacter}
            />
          }
          input={
            <footer
              className={[
                "feedDetailComposer",
                replyComposerActive ? "feedDetailComposer--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label="动态互动栏"
            >
              {replyComposerActive ? (
                <form
                  className="feedDetailReplyComposer"
                  aria-label="回复输入"
                  onSubmit={sendReply}
                >
                  <label className="feedDetailReplyField feedDetailReplyField--active">
                    <span className="visuallyHidden">回复内容</span>
                    <textarea
                      ref={replyInputRef}
                      rows={1}
                      value={replyDraft}
                      placeholder={`reply to ${POST.user}`}
                      onChange={(event) => setReplyDraft(event.target.value)}
                      onFocus={closeReplyPanel}
                    />
                    <div className="feedDetailReplyFieldActions">
                      <button
                        type="button"
                        aria-label={replyPanelOpen ? "切换到键盘" : "选择表情"}
                        aria-pressed={replyPanelOpen}
                        onClick={toggleReplyPanel}
                      >
                        <SystemIcon
                          name={replyPanelOpen ? "keyboard" : "emoji"}
                        />
                      </button>
                      <button
                        type="submit"
                        className="feedDetailReplySend"
                        aria-label="发送回复"
                        disabled={!replyDraft.trim()}
                      >
                        <SystemIcon name="send" size={24} />
                      </button>
                    </div>
                  </label>
                </form>
              ) : (
                <>
                  <label className="feedDetailReplyField">
                    <AvatarVisual
                      size={20}
                      src="/prototypes/feed/andrew-avatar.png"
                      alt=""
                    />
                    <span className="visuallyHidden">回复内容</span>
                    <input
                      type="text"
                      readOnly
                      value=""
                      placeholder={`reply to ${POST.user}`}
                      onFocus={openReplyComposer}
                      onClick={openReplyComposer}
                    />
                    <button
                      type="button"
                      aria-label="选择表情"
                      onClick={() => openReplyComposer({ panel: true })}
                    >
                      <SystemIcon name="emoji" />
                    </button>
                  </label>

                  <div className="feedDetailComposerActions">
                    <button
                      type="button"
                      className={`feedDetailComposerAction${
                        liked ? " feedDetailComposerAction--liked" : ""
                      }`}
                      aria-label={liked ? "取消喜欢" : "喜欢"}
                      aria-pressed={liked}
                      onClick={() => setLiked((current) => !current)}
                    >
                      <SystemIcon name="like" size={22} />
                      <span>{POST.likes}</span>
                    </button>
                    <button
                      type="button"
                      className="feedDetailComposerAction"
                      aria-label="评论"
                      onClick={() => setFeedback("已定位到评论区")}
                    >
                      <SystemIcon name="comment" size={22} />
                      <span>{POST.comments}</span>
                    </button>
                    <button
                      type="button"
                      className="feedDetailComposerAction feedDetailComposerAction--chat"
                      aria-label="私聊"
                      onClick={() => setFeedback(`与 ${POST.user} 聊天`)}
                    >
                      <SystemIcon name="chat" size={22} />
                      <span>chat</span>
                    </button>
                  </div>
                </>
              )}
            </footer>
          }
        />

        {replyPanelOpen ? (
          <button
            type="button"
            className="feedDetailReplyPanelDismiss"
            aria-label="关闭表情面板"
            onClick={closeReplyPanel}
          />
        ) : null}

        {feedback ? (
          <output className="feedDetailFeedback" aria-live="polite">
            {feedback}
          </output>
        ) : null}
        <div className="feedDetailSafeArea" aria-hidden="true" />
      </div>
    </div>
  );
}

function FeedDetailCommentRow({
  comment,
  onReply,
  onMoreReplies,
}: {
  comment: FeedDetailComment;
  onReply: () => void;
  onMoreReplies: () => void;
}) {
  if (comment.kind === "more-replies") {
    return (
      <button
        type="button"
        className="feedDetailMoreReplies"
        style={{ paddingInlineStart: `${16 + (comment.indent ?? 0) * 44}px` }}
        onClick={onMoreReplies}
      >
        <span>{comment.label}</span>
        <SystemIcon name="chevronRight" size={12} />
      </button>
    );
  }

  return (
    <article
      className="feedDetailComment"
      style={{ paddingInlineStart: `${16 + (comment.indent ?? 0) * 44}px` }}
      aria-label={`${comment.author} 的评论`}
    >
      <AvatarVisual size={24} src={comment.avatar} alt="" />
      <div className="feedDetailCommentBody">
        <div className="feedDetailCommentMeta">
          <span className="feedDetailCommentAuthor">{comment.author}</span>
          {comment.kind === "text" && comment.badge === "author" ? (
            <span className="feedDetailAuthorBadge">AUTHOR</span>
          ) : null}
        </div>

        {comment.kind === "text" ? (
          <p className="feedDetailCommentText">{comment.text}</p>
        ) : null}

        {comment.kind === "deleted" ? (
          <p className="feedDetailCommentPlaceholder">Comment Deteled</p>
        ) : null}

        {comment.kind === "reply" ? (
          <>
            <p className="feedDetailCommentText">{comment.text}</p>
            {comment.placeholder ? (
              <p className="feedDetailCommentPlaceholder">
                {comment.placeholder}
              </p>
            ) : null}
          </>
        ) : null}

        <div className="feedDetailCommentFooter">
          <time>{comment.time}</time>
          <button type="button" onClick={onReply}>
            reply
          </button>
        </div>
      </div>
    </article>
  );
}

function commentAuthor(comment: FeedDetailComment) {
  if (comment.kind === "more-replies") return "";
  return comment.author;
}
