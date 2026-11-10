"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { IosStatusBar } from "@/components/kit/ios-status-bar";
import { RegularNavigation } from "@/components/kit/regular-navigation";
import { SystemIcon } from "@/components/kit/system-icon";
import {
  buildFeedAlbumGridAssets,
} from "@/lib/feed-album-assets";

const ALBUM_OPTIONS = ["Recents", "Favorites", "Screenshots"] as const;

const PHOTO_PICKER_GRID_ASSETS = buildFeedAlbumGridAssets();

type FeedComposePhotoPickerPageProps = {
  theme?: "light" | "dark";
  selected: string[];
  draftSelection: string[];
  remainingSlots: number;
  sessionSelectionLimit?: number;
  onClose: () => void;
  onToggle: (src: string) => void;
  onConfirm: () => void;
  onPreview?: () => void;
};

export function FeedComposePhotoPickerPage({
  theme = "light",
  selected,
  draftSelection,
  remainingSlots,
  sessionSelectionLimit = 1,
  onClose,
  onToggle,
  onConfirm,
  onPreview,
}: FeedComposePhotoPickerPageProps) {
  const [album, setAlbum] = useState<(typeof ALBUM_OPTIONS)[number]>(
    "Recents",
  );

  const gridAssets = useMemo(() => PHOTO_PICKER_GRID_ASSETS, []);
  const selectionCount = draftSelection.length;
  const canConfirm = selectionCount === sessionSelectionLimit;

  const cycleAlbum = () => {
    const currentIndex = ALBUM_OPTIONS.indexOf(album);
    const nextAlbum =
      ALBUM_OPTIONS[(currentIndex + 1) % ALBUM_OPTIONS.length] ?? "Recents";
    setAlbum(nextAlbum);
  };

  return (
    <div
      className="feedComposePhotoPickerPage"
      aria-label="相册选择三级页面"
      data-theme={theme}
    >
      <IosStatusBar
        appearance={theme === "dark" ? "light-content" : "dark-content"}
      />

      <RegularNavigation
        title={album}
        leading="close"
        closeLabel="关闭相册"
        onBack={onClose}
        ariaLabel="相册导航"
        trailingKind="icon"
        className="feedComposePhotoPickerNavigation"
        trailing={
          <button
            type="button"
            className="feedComposePhotoPickerAlbum"
            aria-label={`相册：${album}`}
            onClick={cycleAlbum}
          >
            <SystemIcon name="chevronDown" size={20} />
          </button>
        }
      />

      <main className="feedComposePhotoPickerGrid" aria-label="相册图片">
        {gridAssets.map((asset) => {
          const alreadyAttached = selected.includes(asset.src);
          const picked = draftSelection.includes(asset.src);
          const disabled = alreadyAttached;

          return (
            <button
              type="button"
              key={asset.id}
              className={[
                "feedComposePhotoPickerCell",
                picked ? "feedComposePhotoPickerCell--selected" : "",
                alreadyAttached ? "feedComposePhotoPickerCell--attached" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              aria-label={
                alreadyAttached
                  ? `${asset.label} 已添加`
                  : picked
                    ? `取消选择 ${asset.id}`
                    : `选择 ${asset.id}`
              }
              aria-pressed={picked}
              onClick={() => onToggle(asset.src)}
            >
              <Image src={asset.src} alt="" width={90} height={90} />
              {picked ? (
                <span className="feedComposePhotoPickerScrim" aria-hidden="true" />
              ) : null}
              <span
                className={[
                  "feedComposePhotoPickerBadge",
                  picked ? "feedComposePhotoPickerBadge--selected" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-hidden="true"
              />
              {alreadyAttached ? (
                <span className="feedComposePhotoPickerAttached">已添加</span>
              ) : null}
            </button>
          );
        })}
      </main>

      <footer className="feedComposePhotoPickerFooter" aria-label="相册操作">
        <button
          type="button"
          className="feedComposePhotoPickerPreview"
          disabled={!canConfirm}
          onClick={onPreview}
        >
          Preview
        </button>
        <button
          type="button"
          className="kitButton kitButton--height32 kitButton--primary"
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          Done ({selectionCount})
        </button>
      </footer>

      <div className="feedComposeHomeArea" aria-hidden="true">
        <span className="bottomNavigationHomeIndicator" />
      </div>
    </div>
  );
}
