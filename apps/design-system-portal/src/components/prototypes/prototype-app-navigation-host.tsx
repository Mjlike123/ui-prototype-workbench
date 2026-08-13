"use client";

import type { AnimationEvent, CSSProperties, ReactNode } from "react";
import type { PrototypeNavPhase } from "@/lib/prototype-app-navigation-types";

type PrototypeAppNavigationHostProps = {
  phase: PrototypeNavPhase;
  fromPane: ReactNode | null;
  toPane: ReactNode | null;
  activeKey: string;
  fromKey?: string;
  toKey?: string;
  durationMs: number;
  onTransitionEnd: () => void;
  children: ReactNode;
};

export function PrototypeAppNavigationHost({
  phase,
  fromPane,
  toPane,
  activeKey,
  fromKey,
  toKey,
  durationMs,
  onTransitionEnd,
  children,
}: PrototypeAppNavigationHostProps) {
  if (phase === "idle" || !fromPane || !toPane) {
    return (
      <div className="prototypeNavStack">
        <div
          className="prototypeNavPane prototypeNavPane--active"
          key={activeKey}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`prototypeNavStack prototypeNavStack--${phase}`}
      data-prototype-nav-phase={phase}
      style={
        {
          "--prototype-nav-duration": `${durationMs}ms`,
        } as CSSProperties
      }
    >
      <div
        className="prototypeNavPane prototypeNavPane--from"
        key={fromKey}
      >
        {fromPane}
      </div>
      <div
        className="prototypeNavPane prototypeNavPane--to"
        key={toKey}
        onAnimationEnd={(event: AnimationEvent<HTMLDivElement>) => {
          if (event.currentTarget === event.target) onTransitionEnd();
        }}
      >
        {toPane}
      </div>
    </div>
  );
}
