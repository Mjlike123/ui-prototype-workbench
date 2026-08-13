"use client";

import type { KeyboardEvent, ReactNode } from "react";

export type PrimaryNavigationItem = {
  key: string;
  label: string;
};

export type PrimaryNavigationAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onPress?: () => void;
};

type PrimaryNavigationProps = {
  items: PrimaryNavigationItem[];
  value: string;
  onChange: (key: string) => void;
  actions?: PrimaryNavigationAction[];
  onAction?: (key: string) => void;
  ariaLabel?: string;
  className?: string;
};

export function PrimaryNavigation({
  items,
  value,
  onChange,
  actions = [],
  onAction,
  ariaLabel = "一级导航",
  className,
}: PrimaryNavigationProps) {
  const selectItem = (index: number, target?: HTMLButtonElement) => {
    const item = items[index];
    if (!item) return;
    onChange(item.key);
    target?.scrollIntoView?.({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  };

  const handleKeyDown = (
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
    const nextTab = event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      [nextIndex];
    selectItem(nextIndex, nextTab);
    nextTab?.focus();
  };

  return (
    <nav
      className={`primaryNavigation${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
      data-slot="primary-navigation"
    >
      <div className="primaryNavigationItems" role="tablist">
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
              onClick={(event) => selectItem(index, event.currentTarget)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {actions.length > 0 ? (
        <div className="primaryNavigationActions" aria-label="导航操作">
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              aria-label={action.label}
              onClick={() => {
                action.onPress?.();
                onAction?.(action.key);
              }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      ) : null}
    </nav>
  );
}
