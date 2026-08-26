export type StudioFeedComposeAudience = "everyone" | "friends";

export type StudioFeedComposeDraft = {
  caption: string;
  media: string[];
  audience: StudioFeedComposeAudience;
  updatedAt: number;
};

const DRAFT_KEY = "toptop-studio-feed-compose-draft-v1";
const AUDIENCE_KEY = "toptop-studio-feed-compose-audience-v1";

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

export function loadStudioFeedComposeDraft(): StudioFeedComposeDraft | null {
  const draft = readJson<StudioFeedComposeDraft>(DRAFT_KEY);
  if (!draft) {
    return null;
  }
  if (!draft.caption && draft.media.length === 0) {
    return null;
  }
  return draft;
}

export function saveStudioFeedComposeDraft(
  draft: Omit<StudioFeedComposeDraft, "updatedAt">,
) {
  if (!draft.caption.trim() && draft.media.length === 0) {
    clearStudioFeedComposeDraft();
    return;
  }
  writeJson(DRAFT_KEY, {
    ...draft,
    updatedAt: Date.now(),
  } satisfies StudioFeedComposeDraft);
}

export function clearStudioFeedComposeDraft() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(DRAFT_KEY);
}

export function loadStudioFeedComposeAudience(): StudioFeedComposeAudience {
  if (typeof window === "undefined") {
    return "everyone";
  }
  const stored = window.sessionStorage.getItem(AUDIENCE_KEY);
  return stored === "friends" ? "friends" : "everyone";
}

export function saveStudioFeedComposeAudience(audience: StudioFeedComposeAudience) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(AUDIENCE_KEY, audience);
}
