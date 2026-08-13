import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SWIPE_REPLY, useSwipeToReply } from "./use-swipe-to-reply";

function SwipeHarness({
  enabled = true,
  axis = "incoming",
  onCommit,
  onTrackingStart,
  edgeLeft = 0,
}: {
  enabled?: boolean;
  axis?: "incoming" | "outgoing";
  onCommit: () => void;
  onTrackingStart?: () => void;
  edgeLeft?: number;
}) {
  const swipe = useSwipeToReply({
    enabled,
    axis,
    getEdgeGuardLeft: () => edgeLeft,
    onTrackingStart,
    onCommit,
  });

  return (
    <div
      data-testid="swipe-target"
      data-phase={swipe.phase}
      data-ready={swipe.ready ? "true" : "false"}
      data-icon-follow={Math.round(swipe.iconFollow)}
      data-icon-translate={Math.round(swipe.iconTranslate)}
      data-icon-scale={swipe.iconScale.toFixed(2)}
      style={swipe.contentStyle}
      {...swipe.handlers}
    >
      offset:{Math.round(swipe.offset)}
    </div>
  );
}

describe("useSwipeToReply", () => {
  it("commits reply after a horizontal swipe past the threshold", () => {
    const onCommit = vi.fn();
    const onTrackingStart = vi.fn();
    render(
      <SwipeHarness onCommit={onCommit} onTrackingStart={onTrackingStart} />,
    );
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 200,
      button: 0,
    });
    fireEvent.pointerMove(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120 + SWIPE_REPLY.commitThresholdPx + 8,
      clientY: 202,
    });
    expect(onTrackingStart).toHaveBeenCalledOnce();
    expect(target).toHaveAttribute("data-ready", "true");
    expect(target.style.transform).toContain("translate3d(");

    fireEvent.pointerUp(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120 + SWIPE_REPLY.commitThresholdPx + 8,
      clientY: 202,
    });
    expect(onCommit).toHaveBeenCalledOnce();
  });

  it("commits mouse swipe via window listeners", () => {
    const onCommit = vi.fn();
    render(<SwipeHarness onCommit={onCommit} />);
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 2,
      pointerType: "mouse",
      clientX: 140,
      clientY: 220,
      button: 0,
    });
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 140 + SWIPE_REPLY.commitThresholdPx + 12,
        clientY: 222,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        pointerId: 2,
        pointerType: "mouse",
        clientX: 140 + SWIPE_REPLY.commitThresholdPx + 12,
        clientY: 222,
        button: 0,
        bubbles: true,
      }),
    );
    expect(onCommit).toHaveBeenCalledOnce();
  });

  it("commits outgoing reply after a leftward swipe past the threshold", () => {
    const onCommit = vi.fn();
    const onTrackingStart = vi.fn();
    render(
      <SwipeHarness
        axis="outgoing"
        onCommit={onCommit}
        onTrackingStart={onTrackingStart}
      />,
    );
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 280,
      clientY: 200,
      button: 0,
    });
    fireEvent.pointerMove(target, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 280 - SWIPE_REPLY.commitThresholdPx - 8,
      clientY: 202,
    });
    expect(onTrackingStart).toHaveBeenCalledOnce();
    expect(target).toHaveAttribute("data-ready", "true");
    expect(target.style.transform).toContain("translate3d(-");

    fireEvent.pointerUp(target, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 280 - SWIPE_REPLY.commitThresholdPx - 8,
      clientY: 202,
    });
    expect(onCommit).toHaveBeenCalledOnce();
  });

  it("cancels when the swipe stays below the commit threshold", () => {
    vi.useFakeTimers();
    const onCommit = vi.fn();
    render(<SwipeHarness onCommit={onCommit} />);
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 200,
      button: 0,
    });
    fireEvent.pointerMove(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120 + SWIPE_REPLY.feedbackStartPx + 6,
      clientY: 201,
    });
    expect(target).toHaveAttribute("data-phase", "tracking");
    fireEvent.pointerUp(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120 + SWIPE_REPLY.feedbackStartPx + 6,
      clientY: 201,
    });
    expect(onCommit).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(SWIPE_REPLY.settleMs);
    });
    expect(target).toHaveAttribute("data-phase", "idle");
    vi.useRealTimers();
  });

  it("ignores vertical scrolling intent", () => {
    const onCommit = vi.fn();
    const onTrackingStart = vi.fn();
    render(
      <SwipeHarness onCommit={onCommit} onTrackingStart={onTrackingStart} />,
    );
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 200,
      button: 0,
    });
    fireEvent.pointerMove(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 128,
      clientY: 260,
    });
    fireEvent.pointerUp(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 128,
      clientY: 260,
    });

    expect(onTrackingStart).not.toHaveBeenCalled();
    expect(onCommit).not.toHaveBeenCalled();
  });

  it("guards the system back edge", () => {
    const onCommit = vi.fn();
    const onTrackingStart = vi.fn();
    render(
      <SwipeHarness
        onCommit={onCommit}
        onTrackingStart={onTrackingStart}
        edgeLeft={40}
      />,
    );
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 40 + SWIPE_REPLY.edgeGuardPx - 2,
      clientY: 200,
      button: 0,
    });
    fireEvent.pointerMove(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 40 + SWIPE_REPLY.edgeGuardPx - 2 + 60,
      clientY: 200,
    });
    fireEvent.pointerUp(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 40 + SWIPE_REPLY.edgeGuardPx - 2 + 60,
      clientY: 200,
    });

    expect(onTrackingStart).not.toHaveBeenCalled();
  });

  it("nests the reply icon under the bubble then follows a capped stretch", () => {
    const onCommit = vi.fn();
    render(<SwipeHarness onCommit={onCommit} />);
    const target = screen.getByTestId("swipe-target");

    fireEvent.pointerDown(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 200,
      button: 0,
    });
    fireEvent.pointerMove(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120 + 20,
      clientY: 200,
    });

    expect(target).toHaveAttribute("data-phase", "tracking");
    expect(Number(target.getAttribute("data-icon-translate"))).toBe(
      -SWIPE_REPLY.iconNestPx + 20,
    );

    fireEvent.pointerMove(target, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120 + SWIPE_REPLY.maxDisplacementPx,
      clientY: 200,
    });
    expect(Number(target.getAttribute("data-icon-translate"))).toBe(
      SWIPE_REPLY.iconFollowMaxPx,
    );
    expect(Number(target.getAttribute("data-icon-scale"))).toBeGreaterThanOrEqual(
      1,
    );
  });
});
