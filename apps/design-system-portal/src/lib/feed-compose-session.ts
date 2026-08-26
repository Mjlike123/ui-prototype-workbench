export type FeedComposeAudience = "everyone" | "friends";

export type FeedComposeDraft = {
  caption: string;
  media: string[];
  audience: FeedComposeAudience;
  updatedAt: number;
};

export type FeedPublishedPost = {
  id: string;
  caption: string;
  media?: string;
  hashtags: string[];
  createdAt: number;
};

const DRAFT_KEY = "toptop-feed-compose-draft-v1";
const PUBLISHED_KEY = "toptop-feed-published-posts-v1";
const AUDIENCE_KEY = "toptop-feed-compose-audience-v1";

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

export function loadFeedComposeDraft(): FeedComposeDraft | null {
  const draft = readJson<FeedComposeDraft>(DRAFT_KEY);
  if (!draft) {
    return null;
  }
  if (!draft.caption && draft.media.length === 0) {
    return null;
  }
  return draft;
}

export function saveFeedComposeDraft(draft: Omit<FeedComposeDraft, "updatedAt">) {
  if (!draft.caption.trim() && draft.media.length === 0) {
    clearFeedComposeDraft();
    return;
  }
  writeJson(DRAFT_KEY, {
    ...draft,
    updatedAt: Date.now(),
  } satisfies FeedComposeDraft);
}

export function clearFeedComposeDraft() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(DRAFT_KEY);
}

export function loadFeedComposeAudience(): FeedComposeAudience {
  if (typeof window === "undefined") {
    return "everyone";
  }
  const stored = window.sessionStorage.getItem(AUDIENCE_KEY);
  return stored === "friends" ? "friends" : "everyone";
}

export function saveFeedComposeAudience(audience: FeedComposeAudience) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(AUDIENCE_KEY, audience);
}

export function readPublishedFeedPosts(): FeedPublishedPost[] {
  return readJson<FeedPublishedPost[]>(PUBLISHED_KEY) ?? [];
}

export function appendPublishedFeedPost(post: FeedPublishedPost) {
  const current = readPublishedFeedPosts();
  writeJson(PUBLISHED_KEY, [post, ...current]);
}

export function extractFeedHashtags(caption: string): string[] {
  const matches = caption.match(/#[\p{L}\p{N}_]+/gu);
  return matches ? [...new Set(matches)] : [];
}

export function createPublishedFeedPost(input: {
  caption: string;
  media: string[];
}): FeedPublishedPost {
  return {
    id: `published-${Date.now()}`,
    caption: input.caption.trim(),
    media: input.media[0],
    hashtags: extractFeedHashtags(input.caption),
    createdAt: Date.now(),
  };
}
