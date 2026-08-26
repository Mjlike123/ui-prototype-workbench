"use client";

import type { KeyboardEvent } from "react";

export type PillSecondaryTabItem = {
  key: string;
  label: string;
};

export function PillSecondaryTab({
  items,
  value,
  onChange,
  size = "height28",
  ariaLabel = "二级 Tab",
  className,
}: {
  items: readonly PillSecondaryTabItem[];
  value: string;
  onChange: (key: string) => void;
  size?: "height28" | "height24";
  ariaLabel?: string;
  className?: string;
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
        "secondaryTabPill",
        size === "height24" ? "secondaryTabPillHeight24" : "secondaryTabPillHeight28",
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
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
