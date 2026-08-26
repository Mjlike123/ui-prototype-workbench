"use client";

import type { KeyboardEvent } from "react";

export type TextSecondaryTabItem = {
  key: string;
  label: string;
};

/** Figma 856:69960 — 纯文字二级 Tab，无下划线，左对齐 16px 间距 */
export function TextSecondaryTab({
  items,
  value,
  onChange,
  ariaLabel = "二级 Tab",
  className,
  capitalizeInactive = true,
}: {
  items: readonly TextSecondaryTabItem[];
  value: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
  className?: string;
  capitalizeInactive?: boolean;
}) {
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      nextIndex = Math.min(items.length - 1, index + 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = Math.max(0, index - 1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = items.length - 1;
    }
    if (nextIndex === undefined || nextIndex === index) return;
    event.preventDefault();
    onChange(items[nextIndex].key);
  };

  return (
    <div
      className={[
        "secondaryTabText",
        capitalizeInactive ? "secondaryTabText--capitalizeInactive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item, index) => {
        const selected = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={selected ? "selected" : ""}
            onClick={() => onChange(item.key)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
