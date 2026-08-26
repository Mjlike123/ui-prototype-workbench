"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Figma 36:6699 — ChatInput 在上、Tab 在中、面板内容在下的私聊 Composer 栈 */
export function ChatEmojiGifComposerStack({
  input,
  panel,
  open,
  className,
}: {
  input: ReactNode;
  panel: ReactNode;
  open: boolean;
  className?: string;
}) {
  const skipInitialAnimation = useRef(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (skipInitialAnimation.current) {
      skipInitialAnimation.current = false;
      setMounted(open);
      setVisible(open);
      return;
    }

    if (prefersReducedMotion()) {
      setMounted(open);
      setVisible(open);
      return;
    }

    if (open) {
      setMounted(true);
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setVisible(true));
      });
      return () => window.cancelAnimationFrame(frame);
    }

    setVisible(false);
  }, [open]);

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== panelRef.current) return;
    if (event.propertyName !== "transform") return;
    if (!open) {
      setMounted(false);
    }
  };

  return (
    <div
      className={["chatEmojiGifComposerStack", className]
        .filter(Boolean)
        .join(" ")}
      data-open={open ? "true" : "false"}
    >
      <div className="chatEmojiGifComposerInput">{input}</div>
      {open || mounted ? (
        <div
          ref={panelRef}
          className={[
            "chatEmojiGifComposerPanel",
            visible ? "chatEmojiGifComposerPanel--visible" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onTransitionEnd={handleTransitionEnd}
          aria-hidden={!open && !visible}
        >
          {panel}
        </div>
      ) : null}
    </div>
  );
}
