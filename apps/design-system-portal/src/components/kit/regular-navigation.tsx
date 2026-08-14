"use client";

import type { ReactNode } from "react";
import { SystemIcon } from "@/components/kit/system-icon";

export function RegularNavigation({
  title,
  subtitle,
  onBack,
  trailing,
  trailingKind = "icon",
  backLabel = "返回",
  ariaLabel = "二级页面导航",
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  trailing?: ReactNode;
  trailingKind?: "icon" | "button" | "text";
  backLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <nav
      className={`regularNavigation regularNavigation--leading-back regularNavigation--trailing-${
        trailing ? trailingKind : "none"
      }`}
      aria-label={ariaLabel}
    >
      <div className="regularNavigationLeading">
        <button type="button" aria-label={backLabel} onClick={onBack}>
          <SystemIcon name="back" />
        </button>
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
