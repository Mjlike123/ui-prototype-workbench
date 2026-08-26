"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
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
};

const MAX_MEDIA = 4;
const MAX_CHARS = 280;
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
}: StudioFeedComposePageProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [audience, setAudience] = useState<StudioFeedComposeAudience>("everyone");
  const [toast, setToast] = useState<string | null>(null);
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
    window.setTimeout(() => {
      clearStudioFeedComposeDraft();
      setCaption("");
      setMedia([]);
      setMediaPickerOpen(false);
      setPosting(false);
      setToast("Studio 预览：动态已发布");
    }, 900);
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

        <main className="studioFeedComposeScroll">
          <div className="studioFeedComposeBody">
            <section className="studioFeedComposeEditor" aria-label="动态内容">
              <AvatarVisual size={40} src={USER_AVATAR} alt="" />
              <div className="studioFeedComposeComposer">
                <textarea
                  ref={inputRef}
                  className="studioFeedComposeInput"
                  value={caption}
                  onChange={(event) =>
                    setCaption(event.target.value.slice(0, MAX_CHARS))
                  }
                  placeholder="What's happening?"
                  aria-label="动态文案"
                  rows={6}
                />
                <span
                  className={`studioFeedComposeCounter${
                    remaining <= 20 ? " studioFeedComposeCounter--warn" : ""
                  }`}
                  aria-live="polite"
                >
                  {remaining}
                </span>
              </div>
            </section>

            {media.length > 0 ? (
              <section
                className="studioFeedComposeMediaGrid"
                aria-label={`已选图片 ${media.length} 张，还可添加 ${remainingMedia} 张`}
              >
                {media.map((photo) => (
                  <div className="studioFeedComposeMediaItem" key={photo}>
                    <Image src={photo} alt="" width={108} height={108} />
                    <button
                      type="button"
                      className="studioFeedComposeMediaRemove"
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
                    className="studioFeedComposeMediaAdd"
                    aria-label={`继续添加照片，还可添加 ${remainingMedia} 张`}
                    onClick={() => setMediaPickerOpen(true)}
                  >
                    <SystemIcon name="photo" size={20} />
                    <span>{remainingMedia}</span>
                  </button>
                ) : null}
              </section>
            ) : null}

            <section className="studioFeedComposeToolbar" aria-label="发布工具">
              <button
                type="button"
                className="studioFeedComposeToolButton"
                onClick={() => setMediaPickerOpen(true)}
                aria-label="添加照片"
              >
                <SystemIcon name="photo" size={20} />
              </button>
              <button
                type="button"
                className="studioFeedComposeToolButton"
                onClick={() =>
                  setCaption(
                    (current) => `${current}${current ? " " : ""}#OOTD`,
                  )
                }
                aria-label="插入话题标签"
              >
                <span className="studioFeedComposeHashtagGlyph">#</span>
              </button>
            </section>
          </div>

          <footer className="studioFeedComposeFooter" aria-label="发布设置">
            {media.length > 0 ? (
              <p className="studioFeedComposeMediaQuota" aria-live="polite">
                {media.length}/{MAX_MEDIA} photos
              </p>
            ) : null}
            <button
              type="button"
              className="studioFeedComposeAudience"
              aria-label={`可见范围：${audience === "everyone" ? "所有人" : "好友"}`}
              onClick={() => setAudienceSheetOpen(true)}
            >
              <SystemIcon name="contacts" size={16} />
              <span>{audienceLabel}</span>
              <SystemIcon name="chevronRight" size={16} />
            </button>
          </footer>
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
            <div className="feedComposeAudienceOptions">
              {AUDIENCE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`feedComposeAudienceOption${
                    audience === option.value
                      ? " feedComposeAudienceOption--selected"
                      : ""
                  }`}
                  aria-label={option.label}
                  aria-pressed={audience === option.value}
                  onClick={() => selectAudience(option.value)}
                >
                  <span className="feedComposeAudienceOptionCopy">
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                  {audience === option.value ? (
                    <span className="feedComposeAudienceOptionMark" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
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
              <button type="button" onClick={() => leaveCompose("save")}>
                Save draft
              </button>
              <button
                type="button"
                className="feedComposeLeaveActions--danger"
                onClick={() => leaveCompose("discard")}
              >
                Discard
              </button>
              <button
                type="button"
                className="feedComposeMediaCancel"
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
