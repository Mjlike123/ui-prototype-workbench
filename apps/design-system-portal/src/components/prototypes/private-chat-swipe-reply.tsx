"use client";

import type {
  CSSProperties,
  PointerEventHandler,
  ReactNode,
} from "react";
import { SystemIcon } from "@/components/kit/system-icon";
import {
  useSwipeToReply,
  type SwipeToReplyAxis,
} from "./use-swipe-to-reply";

type SwipeRenderProps = {
  contentStyle: CSSProperties;
  handlers: {
    onPointerDown: PointerEventHandler<HTMLDivElement>;
    onPointerMove: PointerEventHandler<HTMLDivElement>;
    onPointerUp: PointerEventHandler<HTMLDivElement>;
    onPointerCancel: PointerEventHandler<HTMLDivElement>;
  };
  leadingAffordance: ReactNode;
};

export function PrivateChatSwipeReplyShell({
  enabled,
  axis = "incoming",
  getEdgeGuardLeft,
  onTrackingStart,
  onCommit,
  children,
}: {
  enabled: boolean;
  /** Incoming: swipe right. Outgoing: swipe left. */
  axis?: SwipeToReplyAxis;
  getEdgeGuardLeft?: () => number;
  onTrackingStart?: () => void;
  onCommit: () => void;
  children: (swipe: SwipeRenderProps) => ReactNode;
}) {
  const swipe = useSwipeToReply({
    enabled,
    axis,
    getEdgeGuardLeft,
    onTrackingStart,
    onCommit,
  });

  const leadingAffordance = (
    <span
      className={`privateChatSwipeReplyIcon privateChatSwipeReplyIcon--${axis}${
        swipe.ready ? " isReady" : ""
      }${swipe.settling ? " isSettling" : ""}`}
      aria-hidden="true"
      style={swipe.iconStyle}
    >
      <SystemIcon name="reply" size={20} />
    </span>
  );

  return (
    <>
      {children({
        contentStyle: swipe.contentStyle,
        handlers: swipe.handlers,
        leadingAffordance,
      })}
    </>
  );
}
