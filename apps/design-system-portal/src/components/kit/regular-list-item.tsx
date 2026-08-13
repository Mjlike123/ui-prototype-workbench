import type { ReactNode } from "react";

export type RegularListItemProps = {
  listType: "action" | "message";
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  tags?: ReactNode;
  trailing?: ReactNode;
  ariaLabel?: string;
  className?: string;
  onPress: () => void;
};

export function RegularListItem({
  listType,
  title,
  subtitle,
  leading,
  tags,
  trailing,
  ariaLabel,
  className,
  onPress,
}: RegularListItemProps) {
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
        aria-label={ariaLabel ?? [title, subtitle].filter(Boolean).join("，")}
        onClick={onPress}
      >
        {leading}
        <span className="regularListContent">
          <span className="regularListTitleRow">
            <strong>{title}</strong>
          </span>
          {tags ? (
            <span className="regularListTags" aria-label="用户身份与等级标签">
              {tags}
            </span>
          ) : null}
          {subtitle ? (
            <span className="regularListSubtitle">{subtitle}</span>
          ) : null}
        </span>
      </button>
      {trailing}
    </div>
  );
}
