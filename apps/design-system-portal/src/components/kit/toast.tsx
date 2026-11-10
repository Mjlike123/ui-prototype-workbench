"use client";

import { SystemIcon } from "@/components/kit/system-icon";

export type ToastStatus = "none" | "success" | "error" | "warning" | "loading";

export type ToastProps = {
  message: string;
  status?: ToastStatus;
  longText?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  className?: string;
  "aria-label"?: string;
};

function ToastStatusIcon({ status }: { status: Exclude<ToastStatus, "none"> }) {
  if (status === "loading") {
    return (
      <span
        className="kitToastStatusIcon kitToastStatusIcon--loading"
        aria-hidden="true"
      >
        <SystemIcon name="loading" size={32} />
      </span>
    );
  }

  return (
    <span className="kitToastStatusIcon" aria-hidden="true">
      <svg viewBox="0 0 32 32" width="32" height="32" role="presentation">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="rgb(255 255 255 / 10%)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        {status === "success" ? (
          <path
            d="M10.5 16.2 14.2 19.8 21.5 12.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {status === "error" ? (
          <path
            d="M12.2 12.2 19.8 19.8M19.8 12.2 12.2 19.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        ) : null}
        {status === "warning" ? (
          <>
            <path
              d="M16 10.5v8.2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="16" cy="22.1" r="1.2" fill="currentColor" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

export function Toast({
  message,
  status = "none",
  longText = false,
  showChevron = false,
  onPress,
  className,
  "aria-label": ariaLabel,
}: ToastProps) {
  const hasStatus = status !== "none";
  const isInteractive = Boolean(showChevron && onPress && !hasStatus && !longText);
  const accessibleName = ariaLabel ?? message;

  const shellClassName = [
    "kitToast",
    hasStatus ? "kitToast--status" : "kitToast--text",
    longText ? "kitToast--long" : "kitToast--short",
    isInteractive ? "kitToast--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {hasStatus ? <ToastStatusIcon status={status} /> : null}
      <p className="kitToastMessage">{message}</p>
      {showChevron && !hasStatus && !longText ? (
        <SystemIcon
          name="chevronRight"
          size={16}
          className="kitToastChevron"
        />
      ) : null}
    </>
  );

  if (isInteractive) {
    return (
      <button
        type="button"
        className={shellClassName}
        onClick={onPress}
        aria-label={accessibleName}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={shellClassName}
      role="status"
      aria-live="polite"
      aria-label={accessibleName}
    >
      {content}
    </div>
  );
}
