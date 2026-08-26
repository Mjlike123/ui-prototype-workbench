"use client";

import {
  BOTTOM_NAV_DESTINATIONS,
  type BottomNavKey,
} from "@/lib/profile-prototype-model";
import { BottomNavigationIcon } from "./bottom-navigation-icon";

export function BottomNavigation({
  value,
  onChange,
  className,
  ariaLabel = "App 一级目的地",
}: {
  value: BottomNavKey;
  onChange: (key: BottomNavKey) => void;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <nav
      className={["bottomNavigation bottomNavigationLight", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
    >
      <div className="bottomNavigationItems">
        {BOTTOM_NAV_DESTINATIONS.map((item) => {
          const selected = item.key === value;
          return (
            <button
              className={`bottomNavigationItem${selected ? " selected" : ""}`}
              key={item.key}
              type="button"
              aria-current={selected ? "page" : undefined}
              aria-label={item.label}
              onClick={() => onChange(item.key)}
            >
              <BottomNavigationIcon name={item.key} selected={selected} />
              <span className="bottomNavigationLabel">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="bottomNavigationSafeArea" aria-hidden="true">
        <span className="bottomNavigationHomeIndicator" />
      </div>
    </nav>
  );
}
