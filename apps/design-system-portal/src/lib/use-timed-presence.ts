"use client";

import { useEffect, useState } from "react";

export type TimedPresencePhase = "enter" | "exit";

export function useTimedPresence(open: boolean, exitDurationMs: number) {
  const [mounted, setMounted] = useState(open);
  const [phase, setPhase] = useState<TimedPresencePhase>("enter");

  useEffect(() => {
    if (open) {
      setMounted(true);
      setPhase("enter");
      return;
    }

    if (!mounted) return;

    setPhase("exit");
    const timer = window.setTimeout(() => {
      setMounted(false);
    }, exitDurationMs);

    return () => window.clearTimeout(timer);
  }, [exitDurationMs, mounted, open]);

  return { mounted, phase };
}
