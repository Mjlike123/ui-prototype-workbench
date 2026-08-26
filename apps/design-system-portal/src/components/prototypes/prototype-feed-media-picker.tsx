"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { SystemIcon } from "@/components/kit/system-icon";

export type FeedAlbumAsset = {
  id: string;
  src: string;
  label: string;
};

export const FEED_ALBUM_ASSETS: FeedAlbumAsset[] = [
  {
    id: "latifa-photo",
    src: "/prototypes/feed/latifa-photo.png",
    label: "Latifa pool",
  },
  {
    id: "feed-avatar",
    src: "/prototypes/profile-v3/feed-avatar.png",
    label: "Feed cover",
  },
  {
    id: "conversation-1",
    src: "/prototypes/message/conversation-1.png",
    label: "Conversation 1",
  },
  {
    id: "conversation-2",
    src: "/prototypes/message/conversation-2.png",
    label: "Conversation 2",
  },
  {
    id: "conversation-3",
    src: "/prototypes/message/conversation-3.png",
    label: "Conversation 3",
  },
  {
    id: "online-1",
    src: "/prototypes/message/online-1.png",
    label: "Online 1",
  },
  {
    id: "group-1",
    src: "/prototypes/message/group-1.png",
    label: "Group 1",
  },
  {
    id: "supporter",
    src: "/prototypes/profile-v3/supporter-card.png",
    label: "Supporter card",
  },
];

/** Simulated camera capture result in prototype. */
export const FEED_CAMERA_CAPTURE = "/prototypes/message/conversation-4.png";

type PickerPhase =
  | "source"
  | "library"
  | "camera-permission"
  | "camera-denied"
  | "camera";

type PrototypeFeedMediaPickerProps = {
  open: boolean;
  selected: string[];
  maxCount?: number;
  onClose: () => void;
  onAddPhotos: (photos: string[]) => void;
};

export function PrototypeFeedMediaPicker({
  open,
  selected,
  maxCount = 4,
  onClose,
  onAddPhotos,
}: PrototypeFeedMediaPickerProps) {
  const [phase, setPhase] = useState<PickerPhase>("source");
  const [draftSelection, setDraftSelection] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);

  const remainingSlots = Math.max(0, maxCount - selected.length);
  const canPickMore = remainingSlots > 0;

  useEffect(() => {
    if (!open) {
      setPhase("source");
      setDraftSelection([]);
      setCapturing(false);
    }
  }, [open]);

  const libraryAssets = useMemo(
    () =>
      FEED_ALBUM_ASSETS.filter(
        (asset) =>
          !selected.includes(asset.src) && !draftSelection.includes(asset.src),
      ),
    [draftSelection, selected],
  );

  if (!open) {
    return null;
  }

  const closeAll = () => {
    setPhase("source");
    setDraftSelection([]);
    setCapturing(false);
    onClose();
  };

  const toggleDraft = (src: string) => {
    if (draftSelection.includes(src)) {
      setDraftSelection((current) => current.filter((item) => item !== src));
      return;
    }
    if (draftSelection.length >= remainingSlots) {
      return;
    }
    setDraftSelection((current) => [...current, src]);
  };

  const confirmLibrary = () => {
    if (draftSelection.length === 0) {
      return;
    }
    onAddPhotos(draftSelection);
    closeAll();
  };

  const capturePhoto = () => {
    if (!canPickMore || capturing) {
      return;
    }
    setCapturing(true);
    window.setTimeout(() => {
      onAddPhotos([FEED_CAMERA_CAPTURE]);
      closeAll();
    }, 420);
  };

  return (
    <div className="feedComposeOverlay" role="presentation">
      <button
        type="button"
        className="feedComposeOverlayBackdrop"
        aria-label="关闭媒体选择"
        onClick={closeAll}
      />
      {phase === "source" ? (
        <section
          className="feedComposeMediaSheet feedComposeMediaSheet--source"
          aria-label="添加照片"
        >
          <div className="feedComposeMediaSheetHandle" aria-hidden="true" />
          <header className="feedComposeMediaSheetHeader">
            <h2>添加照片</h2>
            <p>
              {canPickMore
                ? `还可添加 ${remainingSlots} 张（最多 ${maxCount} 张）`
                : "已达上限，请先移除已选图片"}
            </p>
          </header>
          <div className="feedComposeMediaSourceList">
            <button
              type="button"
              disabled={!canPickMore}
              onClick={() => setPhase("library")}
            >
              <SystemIcon name="photo" size={20} />
              <span>从相册选择</span>
            </button>
            <button
              type="button"
              disabled={!canPickMore}
              onClick={() => setPhase("camera-permission")}
            >
              <SystemIcon name="photo" size={20} />
              <span>拍照</span>
            </button>
          </div>
          <button
            type="button"
            className="feedComposeMediaCancel"
            onClick={closeAll}
          >
            取消
          </button>
        </section>
      ) : null}

      {phase === "library" ? (
        <section
          className="feedComposeMediaSheet feedComposeMediaSheet--library"
          aria-label="相册"
        >
          <header className="feedComposeMediaSheetHeader feedComposeMediaSheetHeader--row">
            <button type="button" onClick={() => setPhase("source")}>
              返回
            </button>
            <div>
              <h2>相册</h2>
              <p>
                已选 {draftSelection.length} / 还可选 {remainingSlots} 张
              </p>
            </div>
            <button
              type="button"
              className="feedComposeMediaConfirm"
              disabled={draftSelection.length === 0}
              onClick={confirmLibrary}
            >
              完成
            </button>
          </header>
          <div className="feedComposeMediaAlbumGrid">
            {FEED_ALBUM_ASSETS.map((asset) => {
              const alreadyAttached = selected.includes(asset.src);
              const picked = draftSelection.includes(asset.src);
              const disabled =
                alreadyAttached ||
                (!picked && draftSelection.length >= remainingSlots);

              return (
                <button
                  type="button"
                  key={asset.id}
                  className={`feedComposeMediaAlbumItem${
                    picked ? " feedComposeMediaAlbumItem--selected" : ""
                  }${alreadyAttached ? " feedComposeMediaAlbumItem--attached" : ""}`}
                  disabled={disabled}
                  aria-label={
                    alreadyAttached
                      ? `${asset.label} 已添加`
                      : picked
                        ? `取消选择 ${asset.label}`
                        : `选择 ${asset.label}`
                  }
                  aria-pressed={picked}
                  onClick={() => toggleDraft(asset.src)}
                >
                  <Image src={asset.src} alt="" width={108} height={108} />
                  {picked ? (
                    <span className="feedComposeMediaAlbumCheck" aria-hidden="true">
                      {draftSelection.indexOf(asset.src) + 1}
                    </span>
                  ) : null}
                  {alreadyAttached ? (
                    <span className="feedComposeMediaAlbumAttached">已添加</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {libraryAssets.length === 0 && draftSelection.length === 0 ? (
            <p className="feedComposeMediaEmpty">相册中没有更多可选图片</p>
          ) : null}
        </section>
      ) : null}

      {phase === "camera-permission" ? (
        <section
          className="feedComposeMediaSheet feedComposeMediaSheet--permission"
          aria-label="相机权限"
        >
          <header className="feedComposeMediaSheetHeader">
            <h2>允许访问相机？</h2>
            <p>TopTop 需要相机权限来拍摄动态照片。你可以在系统设置中随时更改。</p>
          </header>
          <div className="feedComposePermissionActions">
            <button
              type="button"
              className="feedComposePermissionPrimary"
              onClick={() => setPhase("camera")}
            >
              允许
            </button>
            <button
              type="button"
              className="feedComposePermissionSecondary"
              onClick={() => setPhase("camera-denied")}
            >
              不允许
            </button>
          </div>
        </section>
      ) : null}

      {phase === "camera-denied" ? (
        <section
          className="feedComposeMediaSheet feedComposeMediaSheet--permission"
          aria-label="相机权限说明"
        >
          <header className="feedComposeMediaSheetHeader">
            <h2>无法使用相机</h2>
            <p>
              请在 iOS 设置 → TopTop → 相机 中开启权限，或改从相册选择已有照片。
            </p>
          </header>
          <div className="feedComposePermissionActions">
            <button
              type="button"
              className="feedComposePermissionPrimary"
              onClick={() => setPhase("library")}
            >
              从相册选择
            </button>
            <button
              type="button"
              className="feedComposePermissionSecondary"
              onClick={closeAll}
            >
              知道了
            </button>
          </div>
        </section>
      ) : null}

      {phase === "camera" ? (
        <section
          className="feedComposeMediaSheet feedComposeMediaSheet--camera"
          aria-label="拍照"
        >
          <header className="feedComposeMediaSheetHeader feedComposeMediaSheetHeader--row">
            <button type="button" onClick={() => setPhase("source")}>
              取消
            </button>
            <h2>拍照</h2>
            <span aria-hidden="true" />
          </header>
          <div
            className={`feedComposeCameraStage${
              capturing ? " feedComposeCameraStage--capturing" : ""
            }`}
          >
            <div className="feedComposeCameraViewfinder" aria-hidden="true">
              <span>对准主体，点击快门</span>
            </div>
            <button
              type="button"
              className="feedComposeCameraShutter"
              aria-label="拍摄照片"
              disabled={capturing}
              onClick={capturePhoto}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
