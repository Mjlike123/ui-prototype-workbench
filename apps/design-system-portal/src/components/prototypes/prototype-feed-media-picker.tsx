"use client";

import { useEffect, useRef, useState } from "react";
import { FeedComposePhotoPickerPage } from "@/components/prototypes/feed-compose-photo-picker-page";
import { useTimedPresence } from "@/lib/use-timed-presence";

export type { FeedAlbumAsset } from "@/lib/feed-album-assets";
export {
  FEED_ALBUM_ASSETS,
  FEED_CAMERA_CAPTURE,
} from "@/lib/feed-album-assets";

type PrototypeFeedMediaPickerProps = {
  open: boolean;
  selected: string[];
  initialDraftSelection?: string[];
  maxCount?: number;
  theme?: "light" | "dark";
  onClose: () => void;
  onAddPhotos: (photos: string[]) => void;
};

const SESSION_SELECTION_LIMIT = 1;
const PHOTO_PICKER_EXIT_MS = 320;

export function PrototypeFeedMediaPicker({
  open,
  selected,
  initialDraftSelection = [],
  maxCount = 9,
  theme = "light",
  onClose,
  onAddPhotos,
}: PrototypeFeedMediaPickerProps) {
  const [draftSelection, setDraftSelection] = useState<string[]>([]);
  const wasOpenRef = useRef(false);
  const presence = useTimedPresence(open, PHOTO_PICKER_EXIT_MS);

  const remainingSlots = Math.max(0, maxCount - selected.length);
  const canPickMore = remainingSlots > 0;

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraftSelection(initialDraftSelection);
    }
    wasOpenRef.current = open;
  }, [initialDraftSelection, open]);

  useEffect(() => {
    if (!presence.mounted) {
      setDraftSelection([]);
    }
  }, [presence.mounted]);

  if (!presence.mounted || !canPickMore) {
    return null;
  }

  const closeAll = () => {
    onClose();
  };

  const toggleDraft = (src: string) => {
    if (draftSelection.includes(src)) {
      setDraftSelection([]);
      return;
    }
    setDraftSelection([src]);
  };

  const confirmLibrary = () => {
    if (draftSelection.length !== SESSION_SELECTION_LIMIT) {
      return;
    }
    onAddPhotos(draftSelection);
    closeAll();
  };

  return (
    <div
      className={[
        "feedComposePhotoPickerOverlay",
        presence.phase === "exit"
          ? "feedComposePhotoPickerOverlay--exit"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-state={presence.phase}
      role="presentation"
    >
      <button
        type="button"
        className="feedComposePhotoPickerBackdrop"
        aria-label="关闭相册选择层"
        onClick={closeAll}
      />
      <FeedComposePhotoPickerPage
        theme={theme}
        selected={selected}
        draftSelection={draftSelection}
        remainingSlots={remainingSlots}
        sessionSelectionLimit={SESSION_SELECTION_LIMIT}
        onClose={closeAll}
        onToggle={toggleDraft}
        onConfirm={confirmLibrary}
      />
    </div>
  );
}
