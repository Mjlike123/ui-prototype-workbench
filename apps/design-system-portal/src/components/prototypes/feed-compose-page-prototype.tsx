"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { AvatarVisual } from "@/components/kit/avatar-visual";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";

type FeedComposePagePrototypeProps = {
  width?: number;
  height?: number;
  theme?: "light" | "dark";
  onBack: () => void;
};

const MAX_CHARS = 280;
const USER_AVATAR = "/prototypes/feed/andrew-avatar.png";
const SAMPLE_PHOTOS = [
  "/prototypes/feed/latifa-photo.png",
  "/prototypes/profile-v3/feed-avatar.png",
] as const;

export function FeedComposePagePrototype({
  width = 375,
  height = 812,
  theme = "light",
  onBack,
}: FeedComposePagePrototypeProps) {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string[]>([]);
  const [audience, setAudience] = useState<"everyone" | "friends">("everyone");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const remaining = MAX_CHARS - caption.length;
  const canPost = caption.trim().length > 0 || media.length > 0;
  const nextPhoto = useMemo(
    () => SAMPLE_PHOTOS.find((photo) => !media.includes(photo)),
    [media],
  );

  const addPhoto = () => {
    if (!nextPhoto || media.length >= 4) {
      setToast(media.length >= 4 ? "最多添加 4 张图片" : "暂无更多示例图片");
      return;
    }
    setMedia((current) => [...current, nextPhoto]);
  };

  const removePhoto = (photo: string) => {
    setMedia((current) => current.filter((item) => item !== photo));
  };

  const publish = () => {
    if (!canPost) return;
    setToast("动态已发布");
    setCaption("");
    setMedia([]);
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

      <div className="pageCanvasContentShell">
        <RegularNavigation
          title="New post"
          onBack={onBack}
          trailingKind="button"
          trailing={
            <button
              type="button"
              className="regularNavigationActionButton"
              disabled={!canPost}
              aria-disabled={!canPost}
              aria-label="发布动态"
              onClick={publish}
            >
              Post
            </button>
          }
        />

        <main className="feedComposeScroll">
          <section className="feedComposeEditor" aria-label="动态内容">
            <AvatarVisual size={40} src={USER_AVATAR} alt="" />
            <textarea
              className="feedComposeInput"
              value={caption}
              onChange={(event) => setCaption(event.target.value.slice(0, MAX_CHARS))}
              placeholder="What's happening?"
              aria-label="动态文案"
              rows={4}
            />
          </section>

          {media.length > 0 ? (
            <section
              className="feedComposeMediaGrid"
              aria-label={`已选图片 ${media.length} 张`}
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
            </section>
          ) : null}

          <section className="feedComposeToolbar" aria-label="发布工具">
            <button type="button" onClick={addPhoto} aria-label="添加照片">
              <SystemIcon name="photo" size={20} />
              <span>Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setCaption((current) => `${current}${current ? " " : ""}#OOTD`)}
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
              onClick={() =>
                setAudience((current) =>
                  current === "everyone" ? "friends" : "everyone",
                )
              }
            >
              <SystemIcon name="contacts" size={16} />
              <span>
                {audience === "everyone" ? "Everyone can reply" : "Friends only"}
              </span>
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

      {toast ? (
        <div className="profilePrototypeToast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
