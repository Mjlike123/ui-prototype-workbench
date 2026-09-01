"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import { PrototypeFeedMediaPicker } from "@/components/prototypes/prototype-feed-media-picker";
import {
  clearStudioFeedComposeDraft,
  loadStudioFeedComposeAudience,
  loadStudioFeedComposeDraft,
  saveStudioFeedComposeAudience,
  saveStudioFeedComposeDraft,
  type StudioFeedComposeAudience,
} from "@/lib/studio-feed-compose-session";

type StudioFeedComposePageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
  onPublished?: () => void;
};

const MAX_MEDIA = 4;
const MAX_CHARS = 280;
const PUBLISH_DELAY_MS = 900;
const USER_AVATAR = "/prototypes/feed/andrew-avatar.png";

const AUDIENCE_OPTIONS: Array<{
  value: StudioFeedComposeAudience;
  label: string;
  description: string;
}> = [
  {
    value: "everyone",
    label: "Everyone can reply",
    description: "Anyone on TopTop can see and reply",
  },
  {
    value: "friends",
    label: "Friends only",
    description: "Only people you follow can reply",
  },
];

/** Studio-only compose screen; Core uses FeedComposePagePrototype. */
export function StudioFeedComposePage({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
  onPublished,
}: StudioFeedComposePageProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [audience, setAudience] = useState<StudioFeedComposeAudience>("everyone");
  const [toast, setToast] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [audienceSheetOpen, setAudienceSheetOpen] = useState(false);
  const [leaveSheetOpen, setLeaveSheetOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  useEffect(() => {
    const draft = loadStudioFeedComposeDraft();
    if (draft) {
      setCaption(draft.caption);
      setMedia(draft.media);
      setAudience(draft.audience);
      setDraftRestored(true);
    } else {
      setAudience(loadStudioFeedComposeAudience());
    }
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    saveStudioFeedComposeDraft({ caption, media, audience });
  }, [audience, caption, media]);

  useEffect(() => {
    if (!draftRestored) return;
    setToast("已恢复草稿");
    setDraftRestored(false);
  }, [draftRestored]);

  const remaining = MAX_CHARS - caption.length;
  const remainingMedia = MAX_MEDIA - media.length;
  const hasContent = caption.trim().length > 0 || media.length > 0;
  const canPost = hasContent && !posting;

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

  const selectAudience = (next: StudioFeedComposeAudience) => {
    setAudience(next);
    saveStudioFeedComposeAudience(next);
    setAudienceSheetOpen(false);
  };

  const leaveCompose = (mode: "save" | "discard") => {
    if (mode === "discard") {
      clearStudioFeedComposeDraft();
      setCaption("");
      setMedia([]);
    }
    setLeaveSheetOpen(false);
    onBack();
  };

  const requestBack = () => {
    if (posting) return;
    if (hasContent) {
      setLeaveSheetOpen(true);
      return;
    }
    clearStudioFeedComposeDraft();
    onBack();
  };

  const publish = () => {
    if (!hasContent || posting) return;

    setPosting(true);
    setPublishError(null);

    window.setTimeout(() => {
      clearStudioFeedComposeDraft();
      setCaption("");
      setMedia([]);
      setMediaPickerOpen(false);
      setPosting(false);
      setToast("Studio 预览：动态已发布");
      window.setTimeout(() => {
        onPublished?.() ?? onBack();
      }, 520);
    }, PUBLISH_DELAY_MS);
  };

  const audienceLabel =
    audience === "everyone" ? "Everyone can reply" : "Friends only";

  return (
    <div
      className="pageCanvasDevice studioFeedComposeDevice"
      style={
        {
          "--page-canvas-width": `${width}px`,
          "--page-canvas-height": `${height}px`,
        } as CSSProperties
      }
      aria-label={`Studio 发布动态探索 · ${width}×${height}`}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <div className="pageCanvasContentShell">
        <RegularNavigation
          title="New post"
          onBack={requestBack}
          trailingKind="button"
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

        <main className="feedComposeScroll" aria-label="发布动态内容">
          <section className="feedComposeEditor" aria-label="动态内容">
            <AvatarVisual size={40} src={USER_AVATAR} alt="" />
            <textarea
              ref={inputRef}
              className="feedComposeInput"
              value={caption}
              onChange={(event) =>
                setCaption(event.target.value.slice(0, MAX_CHARS))
              }
              placeholder="What's happening?"
              aria-label="动态文案"
              rows={4}
            />
          </section>

          {media.length > 0 ? (
            <section
              className="feedComposeMediaGrid"
              aria-label={`已选图片 ${media.length} 张，还可添加 ${remainingMedia} 张`}
            >
              {media.map((photo) => (
                <div className="feedComposeMediaItem" key={photo}>
                  <Image src={photo} alt="" width={108} height={108} />
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
                  aria-label={`继续添加照片，还可添加 ${remainingMedia} 张`}
                  onClick={() => setMediaPickerOpen(true)}
                >
                  <SystemIcon name="photo" size={20} />
                  <span>{remainingMedia}</span>
                </button>
              ) : null}
            </section>
          ) : null}

          <section className="feedComposeToolbar" aria-label="发布工具">
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              aria-label="添加照片"
            >
              <SystemIcon name="photo" size={20} />
              <span>Photo</span>
            </button>
            <button
              type="button"
              onClick={() =>
                setCaption(
                  (current) => `${current}${current ? " " : ""}#OOTD`,
                )
              }
              aria-label="插入话题标签"
            >
              <span className="feedComposeHashtagGlyph">#</span>
              <span>Hashtag</span>
            </button>
          </section>

          <section className="feedComposeMeta" aria-label="发布设置">
            <button
              type="button"
              className="feedComposeAudience"
              aria-label={`可见范围：${audience === "everyone" ? "所有人" : "好友"}`}
              onClick={() => setAudienceSheetOpen(true)}
            >
              <SystemIcon name="contacts" size={16} />
              <span>{audienceLabel}</span>
              <SystemIcon name="chevronRight" size={16} />
            </button>
            <span
              className={`feedComposeCounter${
                remaining <= 20 ? " feedComposeCounter--warn" : ""
              }`}
              aria-live="polite"
            >
              {remaining}
            </span>
          </section>

          {publishError ? (
            <div className="feedComposePublishError" role="alert">
              <p>{publishError}</p>
              <button type="button" onClick={publish}>
                重试
              </button>
            </div>
          ) : null}
        </main>
      </div>

      <PrototypeFeedMediaPicker
        open={mediaPickerOpen}
        selected={media}
        maxCount={MAX_MEDIA}
        onClose={() => setMediaPickerOpen(false)}
        onAddPhotos={addPhotos}
      />

      {audienceSheetOpen ? (
        <div className="feedComposeOverlay" role="presentation">
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="关闭可见范围设置"
            onClick={() => setAudienceSheetOpen(false)}
          />
          <section
            className="feedComposeMediaSheet feedComposeAudienceSheet"
            aria-label="选择可见范围"
          >
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
            <header className="feedComposeMediaSheetHeader">
              <h2>Who can reply</h2>
              <p>Choose who can see and reply to this post</p>
            </header>
            <div className="feedComposeAudienceOptions" role="list">
              {AUDIENCE_OPTIONS.map((option) => (
                <RegularListItem
                  key={option.value}
                  listType="action"
                  title={option.label}
                  subtitle={option.description}
                  ariaLabel={option.label}
                  className={
                    audience === option.value
                      ? "feedComposeAudienceOption feedComposeAudienceOption--selected"
                      : "feedComposeAudienceOption"
                  }
                  trailing={
                    audience === option.value ? (
                      <span
                        className="feedComposeAudienceOptionMark"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                    ) : undefined
                  }
                  onPress={() => selectAudience(option.value)}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {leaveSheetOpen ? (
        <div className="feedComposeOverlay" role="presentation">
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="继续编辑"
            onClick={() => setLeaveSheetOpen(false)}
          />
          <section
            className="feedComposeMediaSheet feedComposeLeaveSheet"
            aria-label="离开确认"
          >
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
            <header className="feedComposeMediaSheetHeader">
              <h2>Save this post?</h2>
              <p>Your draft will stay on this device until you publish or discard it.</p>
            </header>
            <div className="feedComposeLeaveActions">
              <button
                type="button"
                className="kitButton kitButton--height48 kitButton--primary"
                onClick={() => leaveCompose("save")}
              >
                Save draft
              </button>
              <button
                type="button"
                className="kitButton kitButton--height48 kitButton--primary-outline feedComposeLeaveActions--danger"
                onClick={() => leaveCompose("discard")}
              >
                Discard
              </button>
              <button
                type="button"
                className="feedComposeMediaCancel kitButton kitButton--height48 kitButton--neutral"
                onClick={() => setLeaveSheetOpen(false)}
              >
                Keep editing
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
