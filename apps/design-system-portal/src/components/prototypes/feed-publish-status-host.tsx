"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PublishStatusNotification } from "@/components/kit/publish-status-notification";
import {
  appendPublishedFeedPost,
  createPublishedFeedPost,
} from "@/lib/feed-compose-session";
import {
  clearFeedPublishJob,
  FEED_PUBLISH_STARTED_EVENT,
  FEED_PUBLISH_SUCCESS_MS,
  FEED_PUBLISH_UPLOAD_MS,
  readFeedPublishJob,
  saveFeedPublishJob,
  type FeedPublishJob,
} from "@/lib/feed-publish-status";

type FeedPublishStatusHostProps = {
  onComplete?: () => void;
};

export function FeedPublishStatusHost({ onComplete }: FeedPublishStatusHostProps) {
  const [job, setJob] = useState<FeedPublishJob | null>(null);
  const timersRef = useRef<number[]>([]);
  const processingJobIdRef = useRef<string | null>(null);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearInterval(timer);
      window.clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const dismiss = useCallback(() => {
    clearTimers();
    processingJobIdRef.current = null;
    clearFeedPublishJob();
    setJob(null);
  }, [clearTimers]);

  const runPublishFlow = useCallback(
    (activeJob: FeedPublishJob) => {
      if (activeJob.phase === "failed") {
        setJob(activeJob);
        return;
      }

      if (processingJobIdRef.current === activeJob.id) {
        setJob(activeJob);
        return;
      }

      processingJobIdRef.current = activeJob.id;
      clearTimers();
      setJob(activeJob);

      const elapsed = Date.now() - activeJob.startedAt;
      const remainingUploadMs = Math.max(
        FEED_PUBLISH_UPLOAD_MS - elapsed,
        0,
      );

      const progressTimer = window.setInterval(() => {
        const current = readFeedPublishJob();
        if (!current || current.id !== activeJob.id) {
          return;
        }
        const nextProgress = Math.min(current.progress + 14, 72);
        const nextJob = { ...current, progress: nextProgress };
        saveFeedPublishJob(nextJob);
        setJob(nextJob);
      }, 120);
      timersRef.current.push(progressTimer);

      const uploadTimer = window.setTimeout(() => {
        window.clearInterval(progressTimer);
        const current = readFeedPublishJob();
        if (!current || current.id !== activeJob.id) {
          return;
        }

        const post = createPublishedFeedPost({
          caption: current.caption,
          media: current.media,
        });
        appendPublishedFeedPost(post);
        const successJob: FeedPublishJob = {
          ...current,
          phase: "success",
          progress: 100,
        };
        saveFeedPublishJob(successJob);
        setJob(successJob);
        onComplete?.();

        const hideTimer = window.setTimeout(() => {
          dismiss();
        }, FEED_PUBLISH_SUCCESS_MS);
        timersRef.current.push(hideTimer);
      }, remainingUploadMs);
      timersRef.current.push(uploadTimer);
    },
    [clearTimers, dismiss, onComplete],
  );

  useEffect(() => {
    const syncJob = () => {
      const nextJob = readFeedPublishJob();
      if (!nextJob) {
        setJob(null);
        return;
      }
      runPublishFlow(nextJob);
    };

    window.addEventListener(FEED_PUBLISH_STARTED_EVENT, syncJob);
    const hydrationTimer = window.setTimeout(syncJob, 0);
    return () => {
      window.clearTimeout(hydrationTimer);
      window.removeEventListener(FEED_PUBLISH_STARTED_EVENT, syncJob);
      clearTimers();
    };
  }, [clearTimers, runPublishFlow]);

  const retry = useCallback(() => {
    const current = readFeedPublishJob();
    if (!current) {
      return;
    }
    processingJobIdRef.current = null;
    const nextJob: FeedPublishJob = {
      ...current,
      phase: "uploading",
      progress: 12,
      startedAt: Date.now(),
      failureMessage: undefined,
    };
    saveFeedPublishJob(nextJob);
    runPublishFlow(nextJob);
  }, [runPublishFlow]);

  if (!job) {
    return null;
  }

  return (
    <div className="feedPublishStatusHost">
      <PublishStatusNotification
        status={job.phase}
        message={job.failureMessage}
        thumbnailSrc={job.thumbnail}
        thumbnailPlaceholder={job.caption || "Draft post"}
        progress={job.progress}
        onRetry={job.phase === "failed" ? retry : undefined}
        onDismiss={job.phase === "failed" ? dismiss : undefined}
      />
    </div>
  );
}
