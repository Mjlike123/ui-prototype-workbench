"use client";

import { AvatarVisual } from "@/components/kit/avatar-visual";
import { SystemIcon } from "@/components/kit/system-icon";

export type InRoomNotificationTone = "light" | "dark";
export type InRoomNotificationLayout = "stacked" | "compact";
export type InRoomNotificationAction = "button" | "link" | "none";

export type InRoomNotificationProps = {
  tone?: InRoomNotificationTone;
  layout?: InRoomNotificationLayout;
  action?: InRoomNotificationAction;
  showAvatar?: boolean;
  avatarSrc?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  "aria-label"?: string;
};

export function InRoomNotification({
  tone = "light",
  layout = "stacked",
  action = "button",
  showAvatar = true,
  avatarSrc,
  title = "我是标题",
  description = "我是一段描述文本",
  actionLabel,
  onAction,
  className,
  "aria-label": ariaLabel,
}: InRoomNotificationProps) {
  const resolvedActionLabel =
    actionLabel ??
    (action === "link" ? "文字+icon" : action === "button" ? "按钮" : undefined);
  const accessibleName =
    ariaLabel ??
    (layout === "stacked" ? `${title}，${description}` : description);

  return (
    <article
      className={[
        "kitInRoomNotification",
        `kitInRoomNotification--${tone}`,
        layout === "compact" ? "kitInRoomNotification--compact" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="region"
      aria-label={accessibleName}
    >
      {showAvatar ? (
        <div className="kitInRoomNotificationAvatar" aria-hidden="true">
          <AvatarVisual size={48} src={avatarSrc} alt="" />
        </div>
      ) : null}

      <div className="kitInRoomNotificationContent">
        {layout === "stacked" ? (
          <>
            <p className="kitInRoomNotificationTitle">{title}</p>
            <p className="kitInRoomNotificationDescription">{description}</p>
          </>
        ) : (
          <p className="kitInRoomNotificationMessage">{description}</p>
        )}
      </div>

      {action === "button" && resolvedActionLabel ? (
        <button
          type="button"
          className="kitButton kitButton--height32 kitButton--primary kitInRoomNotificationButton"
          onClick={onAction}
        >
          {resolvedActionLabel}
        </button>
      ) : null}

      {action === "link" && resolvedActionLabel ? (
        <button
          type="button"
          className="kitInRoomNotificationLink"
          onClick={onAction}
        >
          <span>{resolvedActionLabel}</span>
          <SystemIcon
            name="chevronRight"
            size={20}
            className="kitInRoomNotificationLinkIcon"
          />
        </button>
      ) : null}
    </article>
  );
}
