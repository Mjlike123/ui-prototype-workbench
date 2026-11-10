import type { StudioProjectId } from "./studio-project-catalog";

const STUDIO_PROJECT_SESSION_KEYS: Partial<
  Record<StudioProjectId, readonly string[]>
> = {
  "feed-compose": [
    "toptop-studio-feed-compose-draft-v1",
    "toptop-studio-feed-compose-audience-v1",
  ],
  "im-custom-emoji": [
    "toptop-studio-im-custom-emojis-v1",
    "toptop-studio-im-recent-emojis-v1",
  ],
  "voice-room-status": ["voice-room-status-visibility-v326"],
};

export const LEGACY_PAGE_CANVAS_HISTORY_KEY = "toptop-page-canvas-history-v1";

export function clearStudioProjectUserData(projectId: StudioProjectId) {
  if (typeof window === "undefined") return;
  for (const key of STUDIO_PROJECT_SESSION_KEYS[projectId] ?? []) {
    window.sessionStorage.removeItem(key);
  }
}

export function clearLegacyPageCanvasHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LEGACY_PAGE_CANVAS_HISTORY_KEY);
}
