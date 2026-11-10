"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { CenterDialog } from "@/components/kit/center-dialog";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { PublishStatusNotification } from "@/components/kit/publish-status-notification";
import { RegularListItem } from "@/components/kit/regular-list-item";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import { Toast } from "@/components/kit/toast";
import { PrototypeFeedMediaPicker } from "@/components/prototypes/prototype-feed-media-picker";
import {
  clearStudioFeedComposeDraft,
  loadStudioFeedComposeAudience,
  loadStudioFeedComposeDraft,
  saveStudioFeedComposeAudience,
  saveStudioFeedComposeDraft,
  type StudioFeedComposeAudience,
} from "@/lib/studio-feed-compose-session";
import { useTimedPresence } from "@/lib/use-timed-presence";

type StudioFeedComposePageProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
  onPublished?: () => void;
  communityOptions?: StudioFeedComposeCommunityOption[];
  initialCommunity?: string | null;
};

export type StudioFeedComposeCommunityOption = {
  value: string;
  label: string;
  description?: string;
  isNew?: boolean;
  requiresMedia?: boolean;
};

const MAX_MEDIA = 4;
const MAX_CHARS = 280;
const BOTTOM_SHEET_EXIT_MS = 200;
const PUBLISH_DELAY_MS = 900;
const PUBLISH_SUCCESS_MS = 600;

type PublishPhase = "idle" | "uploading" | "success" | "failed";
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
  communityOptions = [],
  initialCommunity = null,
}: StudioFeedComposePageProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [initialDraft] = useState(() => loadStudioFeedComposeDraft());
  const [caption, setCaption] = useState(() => initialDraft?.caption ?? "");
  const [media, setMedia] = useState<string[]>(
    () => initialDraft?.media ?? [],
  );
  const [audience, setAudience] = useState<StudioFeedComposeAudience>(
    () => initialDraft?.audience ?? loadStudioFeedComposeAudience(),
  );
  const [toast, setToast] = useState<string | null>(() =>
    initialDraft ? "已恢复草稿" : null,
  );
  const [publishPhase, setPublishPhase] = useState<PublishPhase>("idle");
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishThumbnail, setPublishThumbnail] = useState<string | undefined>();
  const [publishFailureMessage, setPublishFailureMessage] = useState<
    string | null
  >(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [audienceSheetOpen, setAudienceSheetOpen] = useState(false);
  const [communitySheetOpen, setCommunitySheetOpen] = useState(false);
  const [leaveSheetOpen, setLeaveSheetOpen] = useState(false);
  const [posting, setPosting] = useState(false);
  const [community, setCommunity] = useState<string | null>(initialCommunity);
  const [communityEntryUnread, setCommunityEntryUnread] = useState(() =>
    communityOptions.some((option) => option.isNew),
  );
  const [communityRowsUnread, setCommunityRowsUnread] = useState(() =>
    communityOptions.some((option) => option.isNew),
  );
  const communitySheetPresence = useTimedPresence(
    communitySheetOpen,
    BOTTOM_SHEET_EXIT_MS,
  );
  const audienceSheetPresence = useTimedPresence(
    audienceSheetOpen,
    BOTTOM_SHEET_EXIT_MS,
  );

  useEffect(() => {
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

  const openCommunitySheet = () => {
    setCommunityEntryUnread(false);
    setCommunitySheetOpen(true);
  };

  const closeCommunitySheet = () => {
    setCommunitySheetOpen(false);
    setCommunityRowsUnread(false);
  };

  const selectCommunity = (next: string | null) => {
    setCommunity(next);
    closeCommunitySheet();
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
    setPublishFailureMessage(null);
    setPublishPhase("uploading");
    setPublishProgress(12);
    setPublishThumbnail(media[0]);

    const progressTimer = window.setInterval(() => {
      setPublishProgress((current) => Math.min(current + 14, 72));
    }, 120);

    window.setTimeout(() => {
      window.clearInterval(progressTimer);
      const selectedCommunity = communityOptions.find(
        (option) => option.value === community,
      );
      if (selectedCommunity?.requiresMedia && media.length === 0) {
        setPosting(false);
        setPublishProgress(100);
        setPublishPhase("failed");
        setPublishFailureMessage("该圈子发布需要添加图片，草稿已保留");
        setPublishThumbnail(undefined);
        return;
      }

      clearStudioFeedComposeDraft();
      setCaption("");
      setMedia([]);
      setMediaPickerOpen(false);
      setPosting(false);
      setPublishProgress(100);
      setPublishPhase("success");

      window.setTimeout(() => {
        setPublishPhase("idle");
        if (onPublished) {
          onPublished();
        } else {
          onBack();
        }
      }, PUBLISH_SUCCESS_MS);
    }, PUBLISH_DELAY_MS);
  };

  const dismissPublishStatus = () => {
    setPublishPhase("idle");
    setPublishProgress(0);
    setPublishThumbnail(undefined);
    setPublishFailureMessage(null);
  };

  const audienceLabel =
    audience === "everyone" ? "Everyone can reply" : "Friends only";
  const communityLabel =
    communityOptions.find((option) => option.value === community)?.label ??
    "Select Community";

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

          {communityOptions.length > 0 ? (
            <section
              className="studioFeedComposeCommunityRow"
              aria-label="圈子设置"
              role="list"
            >
              <RegularListItem
                listType="action"
                title="Select Community"
                subtitle={community ? communityLabel : "No community selected"}
                ariaLabel={`选择圈子：${communityLabel}`}
                leading={<SystemIcon name="contacts" size={20} />}
                trailing={
                  <span className="studioFeedComposeCommunityTrailing">
                    {communityEntryUnread ? (
                      <span
                        className="studioMomentUnreadDot"
                        aria-label="有新圈子"
                      />
                    ) : null}
                    <SystemIcon name="chevronRight" size={16} />
                  </span>
                }
                onPress={openCommunitySheet}
              />
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

        </main>
      </div>

      <PrototypeFeedMediaPicker
        open={mediaPickerOpen}
        selected={media}
        maxCount={MAX_MEDIA}
        onClose={() => setMediaPickerOpen(false)}
        onAddPhotos={addPhotos}
      />

      {communitySheetPresence.mounted ? (
        <div
          className={[
            "feedComposeOverlay",
            communitySheetPresence.phase === "exit"
              ? "feedComposeOverlay--exit"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-state={communitySheetPresence.phase}
          role="presentation"
        >
          <button
            type="button"
            className="feedComposeOverlayBackdrop"
            aria-label="关闭圈子选择"
            onClick={closeCommunitySheet}
          />
          <section
            className="feedComposeMediaSheet feedComposeAudienceSheet"
            aria-label="选择圈子"
            role="dialog"
            aria-modal="true"
            data-kit-gap="single-choice-sheet"
          >
            <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
            <header className="feedComposeMediaSheetHeader">
              <h2>Select Community</h2>
              <p>Choose where to share this post</p>
            </header>
            <div className="feedComposeAudienceOptions" role="list">
              <RegularListItem
                listType="action"
                title="No Posting to Any Community"
                ariaLabel={`不发布到圈子${community === null ? "，已选择" : ""}`}
                className={
                  community === null
                    ? "feedComposeAudienceOption feedComposeAudienceOption--selected"
                    : "feedComposeAudienceOption"
                }
                trailing={
                  community === null ? (
                    <span
                      className="feedComposeAudienceOptionMark"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  ) : undefined
                }
                onPress={() => selectCommunity(null)}
              />
              {communityOptions.map((option) => (
                <RegularListItem
                  key={option.value}
                  listType="action"
                  title={option.label}
                  subtitle={option.description}
                  ariaLabel={`${option.label}${
                    community === option.value ? "，已选择" : ""
                  }${option.isNew && communityRowsUnread ? "，新圈子" : ""}`}
                  className={
                    community === option.value
                      ? "feedComposeAudienceOption feedComposeAudienceOption--selected"
                      : "feedComposeAudienceOption"
                  }
                  trailing={
                    <span className="studioFeedComposeCommunityTrailing">
                      {option.isNew && communityRowsUnread ? (
                        <span
                          className="studioMomentUnreadDot"
                          aria-hidden="true"
                        />
                      ) : null}
                      {community === option.value ? (
                        <span
                          className="feedComposeAudienceOptionMark"
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      ) : null}
                    </span>
                  }
                  onPress={() => selectCommunity(option.value)}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

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

      <CenterDialog
        open={leaveSheetOpen}
        title="Save this post?"
        description="Your draft will stay on this device until you publish or discard it."
        dismissible
        onDismiss={() => setLeaveSheetOpen(false)}
        actionLayout="horizontal"
        actions={[
          {
            id: "discard",
            label: "Discard",
            tone: "destructive",
            onPress: () => leaveCompose("discard"),
          },
          {
            id: "save",
            label: "Save draft",
            tone: "primary",
            onPress: () => leaveCompose("save"),
          },
        ]}
      />

      {toast ? (
        <Toast message={toast} className="feedComposeToast" />
      ) : null}

      {publishPhase !== "idle" ? (
        <div className="feedComposePublishStatusAnchor">
          <PublishStatusNotification
            status={publishPhase}
            message={publishFailureMessage ?? undefined}
            thumbnailSrc={publishThumbnail}
            thumbnailPlaceholder={caption.trim() || "Draft post"}
            progress={publishProgress}
            onRetry={publishPhase === "failed" ? publish : undefined}
            onDismiss={
              publishPhase === "failed" ? dismissPublishStatus : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}
