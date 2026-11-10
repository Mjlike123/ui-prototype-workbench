"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { CenterDialog } from "@/components/kit/center-dialog";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SelectorButton } from "@/components/kit/selector-button";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";
import { PrototypeFeedMediaPicker } from "@/components/prototypes/prototype-feed-media-picker";
import {
  clearFeedComposeDraft,
  loadFeedComposeAudience,
  loadFeedComposeDraft,
  saveFeedComposeAudience,
  saveFeedComposeDraft,
  type FeedComposeAudience,
} from "@/lib/feed-compose-session";
import { beginFeedPublish } from "@/lib/feed-publish-status";
import type { FeedComposeCaptureScene } from "@/lib/feed-compose-capture-scenes";
import { useTimedPresence } from "@/lib/use-timed-presence";

type FeedComposePagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  captureScene?: FeedComposeCaptureScene;
  onBack: () => void;
  onPublished?: () => void;
  onMention?: () => void;
  mentionInsertion?: { id: number; text: string };
};

const MAX_MEDIA = 9;
const MAX_CHARS = 280;
const BOTTOM_SHEET_EXIT_MS = 200;
const SUGGESTED_TOPICS = ["#OOTD", "#OOTD", "#OOTD", "#OOTD", "#OOTD"];

const AUDIENCE_OPTIONS: Array<{
  value: FeedComposeAudience;
  label: string;
  description: string;
}> = [
  {
    value: "everyone",
    label: "Public",
    description: "Anyone on TopTop can see this post",
  },
  {
    value: "friends",
    label: "Friends only",
    description: "Only people you follow can see this post",
  },
];

function renderCaptionSegments(text: string): ReactNode[] {
  const parts = text.split(/(#[\p{L}\p{N}_]+)/gu);
  return parts.map((part, index) =>
    part.startsWith("#") ? (
      <span key={`${part}-${index}`} className="feedComposeHashtag">
        {part}
      </span>
    ) : (
      <span key={`text-${index}`}>{part}</span>
    ),
  );
}

/** Core catalog compose screen — do not use in Studio; see StudioFeedComposePage. */
export function FeedComposePagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  captureScene,
  onBack,
  onPublished,
  onMention,
  mentionInsertion,
}: FeedComposePagePrototypeProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mentionRangeRef = useRef<{ start: number; end: number } | null>(null);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [audience, setAudience] = useState<FeedComposeAudience>("everyone");
  const [isLocal, setIsLocal] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [audienceSheetOpen, setAudienceSheetOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const audienceSheetPresence = useTimedPresence(
    audienceSheetOpen,
    BOTTOM_SHEET_EXIT_MS,
  );

  const [pickerInitialDraft, setPickerInitialDraft] = useState<string[]>([]);

  useEffect(() => {
    if (!mentionInsertion) return;
    const input = inputRef.current;
    const range = mentionRangeRef.current ?? {
      start: input?.selectionStart ?? 0,
      end: input?.selectionEnd ?? 0,
    };
    const inserted = `${mentionInsertion.text} `;
    mentionRangeRef.current = null;
    const timer = window.setTimeout(() => {
      setCaption((current) =>
        `${current.slice(0, range.start)}${inserted}${current.slice(range.end)}`.slice(
          0,
          MAX_CHARS,
        ),
      );
      window.requestAnimationFrame(() => {
        input?.focus();
        const cursor = Math.min(range.start + inserted.length, MAX_CHARS);
        input?.setSelectionRange(cursor, cursor);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [mentionInsertion]);

  useEffect(() => {
    if (captureScene) {
      clearFeedComposeDraft();
      setAudience(loadFeedComposeAudience());
      setCaption("");
      setMedia([]);
      setMediaPickerOpen(false);
      setAudienceSheetOpen(false);
      setLeaveDialogOpen(false);
      setPickerInitialDraft([]);

      if (captureScene === "filled") {
        setCaption("Late night swim #OOTD");
        setMedia(["/prototypes/studio/app-login-hero.jpg"]);
      }
      if (
        captureScene === "photo-picker" ||
        captureScene === "photo-picker-selected"
      ) {
        setMediaPickerOpen(true);
        if (captureScene === "photo-picker-selected") {
          setPickerInitialDraft(["/prototypes/studio/app-login-hero.jpg"]);
        }
      }
      if (captureScene === "audience") {
        setCaption("Share what's on your mind…");
        setAudienceSheetOpen(true);
      }
      if (captureScene === "leave") {
        setCaption("Share what's on your mind…");
        setLeaveDialogOpen(true);
      }
      return;
    }

    const draft = loadFeedComposeDraft();
    if (draft) {
      setCaption(draft.caption);
      setMedia(draft.media);
      setAudience(draft.audience);
      setDraftRestored(true);
    } else {
      setAudience(loadFeedComposeAudience());
    }
    inputRef.current?.focus();
  }, [captureScene]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (captureScene) {
      return;
    }
    saveFeedComposeDraft({ caption, media, audience });
  }, [audience, caption, captureScene, media]);

  useEffect(() => {
    if (!draftRestored) return;
    setToast("已恢复草稿");
    setDraftRestored(false);
  }, [draftRestored]);

  const remainingMedia = MAX_MEDIA - media.length;
  const hasContent = caption.trim().length > 0 || media.length > 0;
  const canPost = hasContent && !posting;
  const audienceLabel =
    audience === "everyone" ? "Public" : "Friends only";

  const captionMirror = useMemo(() => renderCaptionSegments(caption), [caption]);

  const addPhotos = (photos: string[]) => {
    setMedia((current) => {
      const merged = [...current];
      for (const photo of photos) {
        if (merged.length >= MAX_MEDIA || merged.includes(photo)) {
          continue;
        }
        merged.push(photo);
      }
      return merged;
    });
  };

  const removePhoto = (photo: string) => {
    setMedia((current) => current.filter((item) => item !== photo));
  };

  const insertHashtag = (tag: string) => {
    const normalized = tag.startsWith("#") ? tag : `#${tag}`;
    setCaption((current) => {
      const spacer = current.length > 0 && !current.endsWith(" ") ? " " : "";
      return `${current}${spacer}${normalized}`.slice(0, MAX_CHARS);
    });
    inputRef.current?.focus();
  };

  const selectAudience = (next: FeedComposeAudience) => {
    setAudience(next);
    saveFeedComposeAudience(next);
    setAudienceSheetOpen(false);
  };

  const leaveCompose = (mode: "save" | "discard") => {
    if (mode === "discard") {
      clearFeedComposeDraft();
      setCaption("");
      setMedia([]);
    }
    setLeaveDialogOpen(false);
    onBack();
  };

  const requestBack = () => {
    if (posting) return;
    if (hasContent) {
      setLeaveDialogOpen(true);
      return;
    }
    clearFeedComposeDraft();
    onBack();
  };

  const publish = () => {
    if (!hasContent || posting) return;

    setPosting(true);
    beginFeedPublish({ caption, media });
    clearFeedComposeDraft();
    setCaption("");
    setMedia([]);
    setMediaPickerOpen(false);
    if (onPublished) {
      onPublished();
    } else {
      onBack();
    }
  };

  return (
    <div
      className="pageCanvasDevice feedComposeDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`发布动态二级页面原型 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell feedComposeShell">
        <RegularNavigation
          title="New post"
          leading="close"
          closeLabel="关闭"
          onBack={requestBack}
          trailingKind="button"
          ariaLabel="发布导航"
          trailing={
            <button
              type="button"
              className={`regularNavigationActionButton${
                posting ? " regularNavigationActionButton--loading" : ""
              }`}
              disabled={!canPost}
              aria-disabled={!canPost}
              aria-busy={posting}
              aria-label={posting ? "发布中" : "发布动态"}
              onClick={publish}
            >
              {posting ? <SystemIcon name="loading" size={16} /> : "Post"}
            </button>
          }
        />

        <main className="feedComposeScroll">
          <section
            className="feedComposeEditor feedComposeEditor--singleColumn"
            aria-label="动态内容"
          >
            <div className="feedComposeCaptionField">
              <div
                className="feedComposeCaptionMirror"
                aria-hidden="true"
                data-placeholder="Share what's on your mind…"
              >
                {caption.length > 0 ? (
                  captionMirror
                ) : (
                  <span className="feedComposeCaptionPlaceholder">
                    Share what&apos;s on your mind…
                  </span>
                )}
              </div>
              <textarea
                ref={inputRef}
                className="feedComposeInput"
                value={caption}
                onChange={(event) => {
                  const next = event.target.value.slice(0, MAX_CHARS);
                  const cursor = event.target.selectionStart;
                  setCaption(next);
                  if (
                    onMention &&
                    !(event.nativeEvent as InputEvent).isComposing &&
                    next.length > caption.length &&
                    next[cursor - 1] === "@"
                  ) {
                    mentionRangeRef.current = { start: cursor - 1, end: cursor };
                    onMention();
                  }
                }}
                placeholder="Share what's on your mind…"
                aria-label="动态文案"
                rows={3}
              />
            </div>

            <section
              className="feedComposeMediaGrid"
              aria-label={
                media.length > 0
                  ? `已选图片 ${media.length} 张，还可添加 ${remainingMedia} 张`
                  : "添加图片"
              }
            >
              {media.map((photo) => (
                <div className="feedComposeMediaItem" key={photo}>
                  <Image src={photo} alt="" width={112} height={112} />
                  <button
                    type="button"
                    className="feedComposeMediaRemove"
                    aria-label="移除图片"
                    onClick={() => removePhoto(photo)}
                  >
                    <SystemIcon name="close" size={16} />
                  </button>
                </div>
              ))}
              {remainingMedia > 0 ? (
                <button
                  type="button"
                  className="feedComposeMediaAdd"
                  aria-label={`添加照片，还可添加 ${remainingMedia} 张`}
                  onClick={() => setMediaPickerOpen(true)}
                >
                  <SystemIcon name="add" size={24} />
                </button>
              ) : null}
            </section>
          </section>

        </main>

        <section className="feedComposeTopicRow" aria-label="话题标签">
          <button
            type="button"
            className="feedComposeTopicChip feedComposeTopicChip--add"
            aria-label="添加话题"
            onClick={() => setToast("话题选择器 · 原型占位")}
          >
            <span>#添加话题</span>
            <SystemIcon name="chevronRight" size={10} />
          </button>
          <div className="feedComposeTopicSuggestions">
            {SUGGESTED_TOPICS.map((topic, index) => (
              <button
                key={`${topic}-${index}`}
                type="button"
                className="feedComposeTopicChip"
                aria-label={`插入 ${topic}`}
                onClick={() => insertHashtag(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        <footer className="feedComposeDock" aria-label="发布工具栏">
          <div className="feedComposeDockTools">
            <button
              type="button"
              className="feedComposeDockIconBtn"
              aria-label="表情"
              onClick={() => setToast("表情面板 · 原型占位")}
            >
              <SystemIcon name="emoji" size={24} />
            </button>
            <button
              type="button"
              className="feedComposeDockIconBtn"
              aria-label="插入话题标签"
              onClick={() => insertHashtag("OOTD")}
            >
              <SystemIcon name="hashtag" size={24} />
            </button>
            {onMention ? (
              <button
                type="button"
                className="feedComposeDockIconBtn feedComposeDockMentionBtn"
                aria-label="提及好友"
                onClick={() => {
                  mentionRangeRef.current = {
                    start: inputRef.current?.selectionStart ?? caption.length,
                    end: inputRef.current?.selectionEnd ?? caption.length,
                  };
                  onMention();
                }}
              >
                @
              </button>
            ) : null}
          </div>
          <div className="feedComposeDockPills">
            <label className="feedComposeLocalPill">
              <span>Local</span>
              <SelectorButton
                selected={isLocal}
                onChange={setIsLocal}
                aria-label="Local 定位"
              />
            </label>
            <button
              type="button"
              className="feedComposeVisibilityPill"
              aria-label={`可见范围：${audience === "everyone" ? "公开" : "好友"}`}
              onClick={() => setAudienceSheetOpen(true)}
            >
              <SystemIcon name="globe" size={20} />
              <span>{audienceLabel}</span>
              <SystemIcon name="chevronRight" size={16} />
            </button>
          </div>
        </footer>

        <div className="feedComposeHomeArea" aria-hidden="true">
          <span className="bottomNavigationHomeIndicator" />
        </div>
      </div>

      <PrototypeFeedMediaPicker
        open={mediaPickerOpen}
        selected={media}
        initialDraftSelection={pickerInitialDraft}
        maxCount={MAX_MEDIA}
        theme={theme}
        onClose={() => setMediaPickerOpen(false)}
        onAddPhotos={addPhotos}
      />

      {audienceSheetPresence.mounted ? (
        <div
          className={[
            "feedComposeOverlay",
            audienceSheetPresence.phase === "exit"
              ? "feedComposeOverlay--exit"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-state={audienceSheetPresence.phase}
          role="presentation"
        >
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="关闭可见范围设置"
            onClick={() => setAudienceSheetOpen(false)}
          />
          <section
            className="feedComposeMediaSheet feedComposeAudienceSheet"
            aria-label="选择可见范围"
            role="dialog"
            aria-modal="true"
            data-kit-gap="single-choice-sheet"
          >
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
            <header className="feedComposeMediaSheetHeader">
              <h2>Who can see this post</h2>
              <p>Choose who can view your post in the feed</p>
            </header>
            <div className="feedComposeAudienceOptions">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={[
                    "feedComposeAudienceOption",
                    audience === option.value
                      ? "feedComposeAudienceOption--selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={option.label}
                  aria-pressed={audience === option.value}
                  onClick={() => selectAudience(option.value)}
                >
                  <span className="feedComposeAudienceOptionCopy">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  {audience === option.value ? (
                    <span
                      className="feedComposeAudienceOptionMark"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <CenterDialog
        open={leaveDialogOpen}
        title="Save this draft?"
        description="Your draft will stay on this device until you publish or discard it."
        dismissible
        onDismiss={() => setLeaveDialogOpen(false)}
        actionLayout="horizontal"
        actions={[
          {
            id: "discard",
            label: "Discard",
            tone: "neutral",
            onPress: () => leaveCompose("discard"),
          },
          {
            id: "save",
            label: "Save",
            tone: "primary",
            onPress: () => leaveCompose("save"),
          },
        ]}
      />

      {toast ? (
        <Toast message={toast} className="feedComposeToast" />
      ) : null}
    </div>
  );
}
