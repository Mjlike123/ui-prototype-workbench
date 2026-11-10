"use client";

import Image from "next/image";
import { SystemIcon } from "@/components/kit/system-icon";

export type PublishStatusNotificationStatus =
  | "uploading"
  | "success"
  | "failed";

const DEFAULT_MESSAGES: Record<PublishStatusNotificationStatus, string> = {
  uploading: "uploading...",
  success: "发布成功！",
  failed: "post failed!",
};

export type PublishStatusNotificationProps = {
  status: PublishStatusNotificationStatus;
  message?: string;
  thumbnailSrc?: string;
  thumbnailPlaceholder?: string;
  progress?: number;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  "aria-label"?: string;
};

function resolveProgress(
  status: PublishStatusNotificationStatus,
  progress?: number,
): number {
  if (typeof progress === "number") {
    return Math.max(0, Math.min(100, progress));
  }
  if (status === "uploading") return 42;
  return 100;
}

export function PublishStatusNotification({
  status,
  message,
  thumbnailSrc,
  thumbnailPlaceholder,
  progress,
  onRetry,
  onDismiss,
  className,
  "aria-label": ariaLabel,
}: PublishStatusNotificationProps) {
  const resolvedMessage = message ?? DEFAULT_MESSAGES[status];
  const resolvedProgress = resolveProgress(status, progress);
  const showActions = status === "failed";

  return (
    <article
      className={[
        "kitPublishStatusNotification",
        `kitPublishStatusNotification--${status}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role={status === "failed" ? "alert" : "status"}
      aria-live={status === "failed" ? "assertive" : "polite"}
      aria-label={ariaLabel ?? resolvedMessage}
    >
      <div className="kitPublishStatusNotificationBody">
        <div
          className={[
            "kitPublishStatusNotificationThumb",
            !thumbnailSrc ? "kitPublishStatusNotificationThumb--placeholder" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {thumbnailSrc ? (
            <Image src={thumbnailSrc} alt="" width={32} height={32} />
          ) : thumbnailPlaceholder ? (
            <span className="kitPublishStatusNotificationThumbCaption">
              {thumbnailPlaceholder}
            </span>
          ) : null}
        </div>

        <p className="kitPublishStatusNotificationMessage">{resolvedMessage}</p>

        {showActions ? (
          <div className="kitPublishStatusNotificationActions">
            {onRetry ? (
              <button
                type="button"
                className="kitPublishStatusNotificationAction"
                aria-label="重试发布"
                onClick={onRetry}
              >
                <SystemIcon name="refresh" size={24} />
              </button>
            ) : null}
            {onDismiss ? (
              <button
                type="button"
                className="kitPublishStatusNotificationAction"
                aria-label="关闭"
                onClick={onDismiss}
              >
                <SystemIcon name="close" size={24} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        className="kitPublishStatusNotificationProgress"
        aria-hidden="true"
      >
        <span
          className="kitPublishStatusNotificationProgressFill"
          style={{ width: `${resolvedProgress}%` }}
        />
      </div>
    </article>
  );
}
