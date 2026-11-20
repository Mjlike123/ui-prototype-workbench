import type { ReactNode } from "react";
import {
  getMessageStatusLabel,
  MessageListStatus,
  MessageStrangerTag,
  type MessageStatus,
} from "./message-list-status";

export type RegularListItemProps = {
  listType: "action" | "message";
  title: string;
  subtitle?: string;
  messageStatus?: MessageStatus;
  leading?: ReactNode;
  tags?: ReactNode;
  trailing?: ReactNode;
  ariaLabel?: string;
  className?: string;
  onPress?: () => void;
};

export function RegularListItem({
  listType,
  title,
  subtitle,
  messageStatus = "default",
  leading,
  tags,
  trailing,
  ariaLabel,
  className,
  onPress,
}: RegularListItemProps) {
  const status = listType === "message" ? messageStatus : "default";
  const statusLabel = getMessageStatusLabel(status);
  const subtitleStatus = status !== "default" && status !== "stranger";
  const label = ariaLabel !== undefined
    ? [ariaLabel, statusLabel].filter(Boolean).join("，")
    : [title, statusLabel, subtitle].filter(Boolean).join("，");

  return (
    <div
      className={[
        "regularListItem",
        listType === "message"
          ? "regularListItem--message"
          : "regularListItem--action",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="listitem"
    >
      <button
        className="regularListMain"
        type="button"
        aria-label={label}
        onClick={onPress}
      >
        {leading}
        <span className="regularListContent">
          <span className="regularListTitleRow">
            <strong>{title}</strong>
            {status === "stranger" && <MessageStrangerTag />}
          </span>
          {tags ? (
            <span className="regularListTags" aria-label="用户身份与等级标签">
              {tags}
            </span>
          ) : null}
          {subtitle || subtitleStatus ? (
            <span className="regularListSubtitle">
              <MessageListStatus status={status} />
              {subtitle}
            </span>
          ) : null}
        </span>
      </button>
      {trailing}
    </div>
  );
}
