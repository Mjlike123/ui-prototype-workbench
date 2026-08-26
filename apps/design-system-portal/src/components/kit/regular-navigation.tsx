"use client";

import type { ReactNode } from "react";
import { SystemIcon } from "@/components/kit/system-icon";

export function RegularNavigation({
  title,
  subtitle,
  leading = "back",
  onBack,
  trailing,
  trailingKind = "icon",
  backLabel = "返回",
  closeLabel = "关闭",
  ariaLabel = "二级页面导航",
  className,
}: {
  title: string;
  subtitle?: string;
  leading?: "none" | "back" | "close";
  onBack?: () => void;
  trailing?: ReactNode;
  trailingKind?: "icon" | "button" | "text";
  backLabel?: string;
  closeLabel?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const trailingClass = trailing ? trailingKind : "none";

  return (
    <nav
      className={[
        "regularNavigation",
        `regularNavigation--leading-${leading}`,
        `regularNavigation--trailing-${trailingClass}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
    >
      <div className="regularNavigationLeading">
        {leading === "back" ? (
          <button type="button" aria-label={backLabel} onClick={onBack}>
            <SystemIcon name="back" />
          </button>
        ) : null}
        {leading === "close" ? (
          <button type="button" aria-label={closeLabel} onClick={onBack}>
            <SystemIcon name="close" />
          </button>
        ) : null}
      </div>
      <div
        className={`regularNavigationTitle${
          subtitle ? " regularNavigationTitleWithSubtitle" : ""
        }`}
      >
        <h1 className="regularNavigationTitleText">{title}</h1>
        {subtitle ? (
          <span className="regularNavigationSubtitle">{subtitle}</span>
        ) : null}
      </div>
      <div className="regularNavigationTrailing">{trailing}</div>
    </nav>
  );
}
