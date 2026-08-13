"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * Spec §4.2 — 收到消息右滑回复；自己发出的消息左滑（右→左）回复。
 * 图标从气泡滑动侧 nest 钻出并跟移一段（Ins / Figma）。
 */
export const SWIPE_REPLY = {
  edgeGuardPx: 24,
  intentRatio: 1.2,
  feedbackStartPx: 10,
  commitThresholdPx: 50,
  maxDisplacementPx: 64,
  settleMs: 180,
  flingVelocityPxPerMs: 0.55,
  flingMinDxPx: 28,
  /** Figma 快捷回复按钮入场 nest（|x|: 32 → 0）。 */
  iconNestPx: 32,
  /** 出 nest 后继续跟气泡的上限（Ins 手感）。 */
  iconFollowMaxPx: 28,
  iconScaleMin: 0,
  /** Spec §12：越过阈值时图标轻微强调。 */
  readyEmphasisMs: 120,
  readyScale: 1.1,
} as const;

export type SwipeToReplyPhase = "idle" | "tracking" | "ready";

/** Incoming: drag right (+). Outgoing: drag left (−). */
export type SwipeToReplyAxis = "incoming" | "outgoing";

type SwipeToReplyOptions = {
  enabled: boolean;
  axis?: SwipeToReplyAxis;
  /** Left edge of the chat device in viewport coords; used for back-gesture guard. */
  getEdgeGuardLeft?: () => number;
  onTrackingStart?: () => void;
  onCommit: () => void;
};

type PointerSample = {
  x: number;
  y: number;
  t: number;
};

function releaseCapture(
  target: EventTarget | null,
  id: number | null,
) {
  if (
    id == null ||
    !(target instanceof HTMLElement) ||
    !target.hasPointerCapture?.(id)
  ) {
    return;
  }
  try {
    target.releasePointerCapture(id);
  } catch {
    // Pointer may already be released after unmount.
  }
}

function isQuotePreviewTarget(
  target: EventTarget | null,
  current: EventTarget | null,
) {
  if (!(target instanceof Element) || !(current instanceof Element)) {
    return false;
  }
  const quote = target.closest(".chatReplyPreview");
  return Boolean(quote && current.contains(quote));
}

export function useSwipeToReply({
  enabled,
  axis = "incoming",
  getEdgeGuardLeft,
  onTrackingStart,
  onCommit,
}: SwipeToReplyOptions) {
  const [offset, setOffset] = useState(0);
  const [phase, setPhase] = useState<SwipeToReplyPhase>("idle");
  const [settling, setSettling] = useState(false);
  const [readyBoost, setReadyBoost] = useState(false);

  const pointerId = useRef<number | null>(null);
  const pointerType = useRef<string | null>(null);
  const origin = useRef<PointerSample | null>(null);
  const lastSample = useRef<PointerSample | null>(null);
  const locked = useRef(false);
  const didHaptic = useRef(false);
  const trackingNotified = useRef(false);
  const offsetRef = useRef(0);
  const captureTarget = useRef<HTMLElement | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const readyBoostTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const wasReady = useRef(false);
  const onTrackingStartRef = useRef(onTrackingStart);
  const onCommitRef = useRef(onCommit);
  const enabledRef = useRef(enabled);
  const axisRef = useRef(axis);
  /** +1 incoming (right), −1 outgoing (left) */
  const axisSign = axis === "outgoing" ? -1 : 1;

  onTrackingStartRef.current = onTrackingStart;
  onCommitRef.current = onCommit;
  enabledRef.current = enabled;
  axisRef.current = axis;

  const updateOffset = useCallback((value: number) => {
    offsetRef.current = value;
    setOffset(value);
  }, []);

  const clearSettleTimer = useCallback(() => {
    if (!settleTimer.current) return;
    clearTimeout(settleTimer.current);
    settleTimer.current = undefined;
  }, []);

  const clearReadyBoostTimer = useCallback(() => {
    if (!readyBoostTimer.current) return;
    clearTimeout(readyBoostTimer.current);
    readyBoostTimer.current = undefined;
  }, []);

  const visualOffset = useCallback((rawDx: number, sign: number) => {
    const progress = rawDx * sign;
    if (progress <= 0) return 0;
    if (progress <= SWIPE_REPLY.maxDisplacementPx) return progress;
    const overshoot = progress - SWIPE_REPLY.maxDisplacementPx;
    return SWIPE_REPLY.maxDisplacementPx + overshoot * 0.22;
  }, []);

  const fireHapticOnce = useCallback(() => {
    if (didHaptic.current) return;
    didHaptic.current = true;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(10);
    }
  }, []);

  const triggerReadyEmphasis = useCallback(() => {
    if (wasReady.current) return;
    wasReady.current = true;
    clearReadyBoostTimer();
    setReadyBoost(true);
    readyBoostTimer.current = setTimeout(() => {
      setReadyBoost(false);
      readyBoostTimer.current = undefined;
    }, SWIPE_REPLY.readyEmphasisMs);
  }, [clearReadyBoostTimer]);

  const settleToIdle = useCallback(() => {
    clearSettleTimer();
    clearReadyBoostTimer();
    setReadyBoost(false);
    wasReady.current = false;
    setSettling(true);
    updateOffset(0);
    setPhase("idle");
    settleTimer.current = setTimeout(() => {
      setSettling(false);
      settleTimer.current = undefined;
    }, SWIPE_REPLY.settleMs);
  }, [clearReadyBoostTimer, clearSettleTimer, updateOffset]);

  const suppressNextClick = useCallback(() => {
    const kill = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("click", kill, true);
    window.setTimeout(() => {
      window.removeEventListener("click", kill, true);
    }, 0);
  }, []);

  const detachWindowListenersRef = useRef<() => void>(() => undefined);

  const resetGesture = useCallback(() => {
    detachWindowListenersRef.current();
    pointerId.current = null;
    pointerType.current = null;
    origin.current = null;
    lastSample.current = null;
    locked.current = false;
    didHaptic.current = false;
    trackingNotified.current = false;
    captureTarget.current = null;
  }, []);

  const finishGesture = useCallback(
    (sample?: PointerSample) => {
      if (sample) lastSample.current = sample;

      const target = captureTarget.current;
      const id = pointerId.current;
      releaseCapture(target, id);

      const start = origin.current;
      const last = lastSample.current;
      const wasLocked = locked.current;
      const currentOffset = offsetRef.current;
      const type = pointerType.current;
      resetGesture();

      if (!wasLocked || !start || !last) {
        updateOffset(0);
        setPhase("idle");
        wasReady.current = false;
        setReadyBoost(false);
        return;
      }

      if (type === "mouse") suppressNextClick();

      const dx = last.x - start.x;
      const dt = Math.max(last.t - start.t, 1);
      const sign = axisRef.current === "outgoing" ? -1 : 1;
      const progress = dx * sign;
      const velocity = (dx / dt) * sign;
      const flingCommit =
        velocity >= SWIPE_REPLY.flingVelocityPxPerMs &&
        progress >= SWIPE_REPLY.flingMinDxPx;
      const thresholdCommit = currentOffset >= SWIPE_REPLY.commitThresholdPx;

      if (thresholdCommit || flingCommit) {
        onCommitRef.current();
      }
      settleToIdle();
    },
    [resetGesture, settleToIdle, suppressNextClick, updateOffset],
  );

  const handleMove = useCallback(
    (clientX: number, clientY: number, timeStamp: number) => {
      if (!origin.current || pointerId.current == null) return;

      const sign = axisRef.current === "outgoing" ? -1 : 1;
      const dx = clientX - origin.current.x;
      const dy = clientY - origin.current.y;
      lastSample.current = { x: clientX, y: clientY, t: timeStamp };

      if (!locked.current) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const progress = dx * sign;
        if (absDx < 4 && absDy < 4) return;
        if (absDx <= absDy * SWIPE_REPLY.intentRatio || progress <= 0) {
          releaseCapture(captureTarget.current, pointerId.current);
          resetGesture();
          updateOffset(0);
          setPhase("idle");
          return;
        }
        locked.current = true;
        if (
          pointerType.current !== "mouse" &&
          captureTarget.current &&
          pointerId.current != null
        ) {
          try {
            captureTarget.current.setPointerCapture(pointerId.current);
          } catch {
            // Pointer capture can fail after the target unmounts.
          }
        }
        if (!trackingNotified.current) {
          trackingNotified.current = true;
          onTrackingStartRef.current?.();
        }
      }

      const nextOffset = visualOffset(dx, sign);
      updateOffset(nextOffset);

      if (nextOffset >= SWIPE_REPLY.commitThresholdPx) {
        setPhase("ready");
        fireHapticOnce();
        triggerReadyEmphasis();
      } else {
        setPhase("tracking");
        wasReady.current = false;
      }
    },
    [
      fireHapticOnce,
      resetGesture,
      triggerReadyEmphasis,
      updateOffset,
      visualOffset,
    ],
  );

  const attachWindowListeners = useCallback(
    (id: number) => {
      const onWindowMove = (event: PointerEvent) => {
        if (event.pointerId !== id) return;
        event.preventDefault();
        handleMove(event.clientX, event.clientY, event.timeStamp);
      };
      const onWindowUp = (event: PointerEvent) => {
        if (event.pointerId !== id) return;
        finishGesture({
          x: event.clientX,
          y: event.clientY,
          t: event.timeStamp,
        });
      };

      window.addEventListener("pointermove", onWindowMove);
      window.addEventListener("pointerup", onWindowUp);
      window.addEventListener("pointercancel", onWindowUp);
      detachWindowListenersRef.current = () => {
        window.removeEventListener("pointermove", onWindowMove);
        window.removeEventListener("pointerup", onWindowUp);
        window.removeEventListener("pointercancel", onWindowUp);
        detachWindowListenersRef.current = () => undefined;
      };
    },
    [finishGesture, handleMove],
  );

  useEffect(
    () => () => {
      detachWindowListenersRef.current();
      clearSettleTimer();
      clearReadyBoostTimer();
    },
    [clearReadyBoostTimer, clearSettleTimer],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabledRef.current) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (settling) return;
      // Quote locate keeps its own click path; swipe starts from bubble body.
      if (isQuotePreviewTarget(event.target, event.currentTarget)) return;

      // System back-edge guard only for incoming (rightward) swipe.
      if (event.pointerType !== "mouse" && axisRef.current === "incoming") {
        const guardLeft =
          (getEdgeGuardLeft?.() ?? 0) + SWIPE_REPLY.edgeGuardPx;
        if (event.clientX < guardLeft) return;
      }

      clearSettleTimer();
      clearReadyBoostTimer();
      setSettling(false);
      setReadyBoost(false);
      wasReady.current = false;
      pointerId.current = event.pointerId;
      pointerType.current = event.pointerType;
      captureTarget.current = event.currentTarget;
      const sample = {
        x: event.clientX,
        y: event.clientY,
        t: event.timeStamp,
      };
      origin.current = sample;
      lastSample.current = sample;
      locked.current = false;
      didHaptic.current = false;
      trackingNotified.current = false;
      setPhase("idle");
      updateOffset(0);

      if (event.pointerType === "mouse") {
        attachWindowListeners(event.pointerId);
      }
    },
    [
      attachWindowListeners,
      clearReadyBoostTimer,
      clearSettleTimer,
      getEdgeGuardLeft,
      settling,
      updateOffset,
    ],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerType.current === "mouse") return;
      if (
        !enabledRef.current ||
        pointerId.current !== event.pointerId ||
        !origin.current
      ) {
        return;
      }
      event.preventDefault();
      handleMove(event.clientX, event.clientY, event.timeStamp);
    },
    [handleMove],
  );

  const finishPointer = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerType.current === "mouse") return;
      if (!enabledRef.current || pointerId.current !== event.pointerId) return;
      finishGesture({
        x: event.clientX,
        y: event.clientY,
        t: event.timeStamp,
      });
    },
    [finishGesture],
  );

  const tracking = phase === "tracking" || phase === "ready";
  const reveal = Math.min(
    1,
    Math.max(0, (offset - 4) / (SWIPE_REPLY.commitThresholdPx - 4)),
  );
  const revealEased = reveal * reveal * (3 - 2 * reveal);
  const iconOpacity =
    offset <= 0
      ? 0
      : Math.min(1, Math.max(0, (offset - 4) / SWIPE_REPLY.feedbackStartPx));
  const baseScale =
    offset <= 0
      ? SWIPE_REPLY.iconScaleMin
      : SWIPE_REPLY.iconScaleMin +
        revealEased * (1 - SWIPE_REPLY.iconScaleMin);
  const iconScale = readyBoost
    ? SWIPE_REPLY.readyScale
    : phase === "ready"
      ? 1
      : baseScale;
  /** Nest under swipe-side edge, then travel with bubble up to follow cap. */
  const iconTravel = Math.min(
    Math.max(0, offset),
    SWIPE_REPLY.iconNestPx + SWIPE_REPLY.iconFollowMaxPx,
  );
  const iconTranslate = (-SWIPE_REPLY.iconNestPx + iconTravel) * axisSign;
  const iconFollow = Math.max(0, iconTravel - SWIPE_REPLY.iconNestPx);

  const contentStyle: CSSProperties = {
    transform: offset
      ? `translate3d(${offset * axisSign}px, 0, 0)`
      : undefined,
    transition: settling
      ? `transform ${SWIPE_REPLY.settleMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
      : phase === "idle"
        ? undefined
        : "none",
    cursor: tracking ? "grabbing" : "grab",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "pan-y",
  };

  const iconStyle: CSSProperties = {
    opacity: iconOpacity,
    transform: `translate3d(${iconTranslate}px, 0, 0) scale(${iconScale})`,
    transition: settling
      ? `opacity ${SWIPE_REPLY.settleMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), transform ${SWIPE_REPLY.settleMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
      : readyBoost || phase === "ready"
        ? `transform ${SWIPE_REPLY.readyEmphasisMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`
        : tracking
          ? "none"
          : undefined,
  };

  return {
    offset,
    phase,
    settling,
    ready: phase === "ready",
    tracking,
    iconOpacity,
    iconScale,
    iconFollow,
    iconTranslate,
    contentStyle,
    iconStyle,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishPointer,
      onPointerCancel: finishPointer,
    },
  };
}
