export type FeedPublishPhase = "uploading" | "success" | "failed";

export type FeedPublishJob = {
  id: string;
  caption: string;
  media: string[];
  thumbnail?: string;
  phase: FeedPublishPhase;
  progress: number;
  startedAt: number;
  failureMessage?: string;
};

export const FEED_PUBLISH_UPLOAD_MS = 900;
export const FEED_PUBLISH_SUCCESS_MS = 600;
export const FEED_PUBLISH_STARTED_EVENT = "toptop-feed-publish-started";

const PUBLISH_JOB_KEY = "toptop-feed-publish-job-v1";

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

export function readFeedPublishJob(): FeedPublishJob | null {
  return readJson<FeedPublishJob>(PUBLISH_JOB_KEY);
}

export function saveFeedPublishJob(job: FeedPublishJob) {
  writeJson(PUBLISH_JOB_KEY, job);
}

export function clearFeedPublishJob() {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(PUBLISH_JOB_KEY);
}

export function beginFeedPublish(input: {
  caption: string;
  media: string[];
}) {
  const job: FeedPublishJob = {
    id: `publish-${Date.now()}`,
    caption: input.caption.trim(),
    media: input.media,
    thumbnail: input.media[0],
    phase: "uploading",
    progress: 12,
    startedAt: Date.now(),
  };
  saveFeedPublishJob(job);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FEED_PUBLISH_STARTED_EVENT));
  }
  return job;
}

export function notifyFeedPublishJobChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(FEED_PUBLISH_STARTED_EVENT));
  }
}
