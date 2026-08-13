"use client";

import type { KeyboardEvent } from "react";

export type UnderlineSecondaryTabItem = {
  key: string;
  label: string;
};

export function UnderlineSecondaryTab({
  items,
  value,
  onChange,
  ariaLabel = "二级导航",
  className,
}: {
  items: readonly [UnderlineSecondaryTabItem, UnderlineSecondaryTabItem];
  value: string;
  onChange: (key: string) => void;
  ariaLabel?: string;
  className?: string;
}) {
  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") nextIndex = Math.min(1, index + 1);
    if (event.key === "ArrowLeft") nextIndex = Math.max(0, index - 1);
    if (nextIndex === undefined || nextIndex === index) return;
    event.preventDefault();
    onChange(items[nextIndex].key);
  };

  return (
    <div
      className={[
        "secondaryTabUnderline",
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
