"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MOTION_SPRING_STANDARD,
  runSpringSimulation,
} from "@/lib/motion-spring";

const STANDARD_EASING = "cubic-bezier(0.2, 0, 0, 1)";
const HOLD_AT_TARGET_MS = 320;
const STANDARD_COMPARE_DURATION_MS = 640;

type MotionTokenPreviewProps = {
  tokenId: string;
};

export function MotionTokenPreview({ tokenId }: MotionTokenPreviewProps) {
  switch (tokenId) {
    case "motion.duration.instant":
      return <MotionInstantDemo />;
    case "motion.duration.standard":
      return <MotionStandardDemo />;
    case "motion.duration.emphasized":
      return <MotionEmphasizedDemo />;
    case "motion.easing.standard":
      return <MotionEasingDemo />;
    case "motion.spring.standard":
      return <MotionSpringDemo />;
    default:
      return null;
  }
}

function MotionPreviewShell({
  label,
  onActivate,
  children,
}: {
  label: string;
  onActivate?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="motionTokenPreview"
      aria-label={label}
      onClick={onActivate}
    >
      <span className="motionTokenPreviewDemo">{children}</span>
      <span className="motionTokenPreviewHint">{label}</span>
    </button>
  );
}

function useTimeoutChain() {
  const timeoutsRef = useRef<number[]>([]);

  const schedule = useCallback((callback: () => void, delay: number) => {
    const id = window.setTimeout(callback, delay);
    timeoutsRef.current.push(id);
  }, []);

  const clear = useCallback(() => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  useEffect(() => clear, [clear]);

  return { schedule, clear };
}

function useSpringTrackReplay() {
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef<(() => void) | null>(null);
  const { schedule, clear } = useTimeoutChain();

  const replay = useCallback(() => {
    cancelRef.current?.();
    clear();
    setProgress(0);

    cancelRef.current = runSpringSimulation({
      to: 1,
      onUpdate: setProgress,
      onComplete: () => {
        schedule(() => {
          cancelRef.current = runSpringSimulation({
            from: 1,
            to: 0,
            onUpdate: setProgress,
            onComplete: () => setProgress(0),
          });
        }, HOLD_AT_TARGET_MS);
      },
    });
  }, [clear, schedule]);

  useEffect(() => () => {
    cancelRef.current?.();
    clear();
  }, [clear]);

  return { progress, replay };
}

function MotionTrackDot({
  progress,
  variant,
  animation,
  onAnimationEnd,
}: {
  progress?: number;
  variant: "standard" | "spring" | "linear";
  animation?: string;
  onAnimationEnd?: () => void;
}) {
  return (
    <span
      className={`motionTokenTrackDot motionTokenTrackDot--${variant}`}
      style={{
        left: progress === undefined ? undefined : `${progress * 100}%`,
        animation,
      }}
      onAnimationEnd={onAnimationEnd}
    />
  );
}

function MotionInstantDemo() {
  const [active, setActive] = useState(false);

  return (
    <MotionPreviewShell
      label="点击感受颜色反馈"
      onActivate={() => {
        setActive(true);
        window.setTimeout(() => setActive(false), 300);
      }}
    >
      <span
        className={`motionTokenInstantTarget${
          active ? " motionTokenInstantTarget--active" : ""
        }`}
        style={{
          transition: `background-color 300ms ${STANDARD_EASING}`,
        }}
      >
        Press
      </span>
    </MotionPreviewShell>
  );
}

function MotionStandardDemo() {
  const [tab, setTab] = useState<"a" | "b">("a");
  const { schedule, clear } = useTimeoutChain();

  return (
    <MotionPreviewShell
      label="点击切换 Tab 指示器"
      onActivate={() => {
        clear();
        setTab("b");
        schedule(() => setTab("a"), 200 + HOLD_AT_TARGET_MS);
      }}
    >
      <span className="motionTokenStandardTabs" role="presentation">
        <span className={tab === "a" ? "is-active" : ""}>Feed</span>
        <span className={tab === "b" ? "is-active" : ""}>Room</span>
        <span
          className="motionTokenStandardIndicator"
          style={{
            transform: tab === "a" ? "translateX(0%)" : "translateX(100%)",
            transition: `transform 200ms ${STANDARD_EASING}`,
          }}
        />
      </span>
    </MotionPreviewShell>
  );
}

function MotionEmphasizedDemo() {
  const [open, setOpen] = useState(false);
  const { schedule, clear } = useTimeoutChain();

  return (
    <MotionPreviewShell
      label="点击打开强调弹层"
      onActivate={() => {
        clear();
        setOpen(true);
        schedule(() => setOpen(false), 320 + HOLD_AT_TARGET_MS + 320);
      }}
    >
      <span className="motionTokenEmphasizedStage" aria-hidden="true">
        <span className="motionTokenEmphasizedBackdrop" />
        <span
          className={`motionTokenEmphasizedSheet${
            open ? " motionTokenEmphasizedSheet--open" : ""
          }`}
          style={{
            transition: `transform 320ms ${STANDARD_EASING}, opacity 320ms ${STANDARD_EASING}`,
          }}
        />
      </span>
    </MotionPreviewShell>
  );
}

function MotionEasingDemo() {
  const [standardPhase, setStandardPhase] = useState<"idle" | "forward" | "back">(
    "idle",
  );
  const { progress, replay } = useSpringTrackReplay();
  const { schedule, clear } = useTimeoutChain();

  const replayAll = useCallback(() => {
    clear();
    replay();
    setStandardPhase("forward");
  }, [clear, replay]);

  return (
    <MotionPreviewShell
      label="点击对比 standard 与 spring"
      onActivate={replayAll}
    >
      <span className="motionTokenCompareTracks">
        <span className="motionTokenCompareTrack">
          <span className="motionTokenCompareTrackLabel">standard</span>
          <span className="motionTokenCompareTrackBar">
            <MotionTrackDot
              variant="standard"
              animation={
                standardPhase === "forward"
                  ? `motionTokenTrackRun ${STANDARD_COMPARE_DURATION_MS}ms ${STANDARD_EASING} forwards`
                  : standardPhase === "back"
                    ? `motionTokenTrackRunBack ${STANDARD_COMPARE_DURATION_MS}ms ${STANDARD_EASING} forwards`
                    : undefined
              }
              onAnimationEnd={() => {
                if (standardPhase === "forward") {
                  schedule(() => setStandardPhase("back"), HOLD_AT_TARGET_MS);
                  return;
                }
                if (standardPhase === "back") {
                  setStandardPhase("idle");
                }
              }}
            />
          </span>
        </span>
        <span className="motionTokenCompareTrack">
          <span className="motionTokenCompareTrackLabel">spring</span>
          <span className="motionTokenCompareTrackBar motionTokenCompareTrackBar--spring">
            <MotionTrackDot progress={progress} variant="spring" />
          </span>
        </span>
      </span>
    </MotionPreviewShell>
  );
}

function MotionSpringDemo() {
  const { progress, replay } = useSpringTrackReplay();

  return (
    <MotionPreviewShell label="点击观察 overshoot 回弹" onActivate={replay}>
      <span className="motionTokenSpringStage">
        <span className="motionTokenSpringTarget" aria-hidden="true">
          <span>target</span>
        </span>
        <span className="motionTokenSpringTrack">
          <MotionTrackDot progress={progress} variant="spring" />
        </span>
        <span className="motionTokenSpringMeta">
          stiffness {MOTION_SPRING_STANDARD.stiffness} · damping{" "}
          {MOTION_SPRING_STANDARD.damping}
        </span>
      </span>
    </MotionPreviewShell>
  );
}
