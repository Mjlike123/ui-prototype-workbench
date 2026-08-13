"use client";

import { useEffect, useState } from "react";

type FoundationTab = {
  id: string;
  label: string;
};

export function FoundationTabs({ items }: { items: FoundationTab[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-150px 0px -65% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="foundationQuickNav" aria-label="视觉基础快速定位">
      {items.map((item) => (
        <a
          className={`foundationQuickTab ${
            activeId === item.id ? "foundationQuickTabActive" : ""
          }`}
          href={`#${item.id}`}
          aria-current={activeId === item.id ? "location" : undefined}
          key={item.id}
          onClick={() => setActiveId(item.id)}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
