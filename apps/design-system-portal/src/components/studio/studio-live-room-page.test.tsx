import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioLiveRoomPage } from "./studio-live-room-page";

describe("StudioLiveRoomPage", () => {
  it("renders live room shell with gift panel trigger", () => {
    render(<StudioLiveRoomPage onBack={vi.fn()} />);

    expect(
      document.querySelector(".studioLiveRoomDevice"),
    ).toBeInTheDocument();
    expect(screen.getByText("Latifa Alghanim")).toBeInTheDocument();
    expect(screen.getAllByLabelText("打开送礼面板").length).toBeGreaterThan(0);
  });

  it("opens gift panel, selects gift, and sends to chat", () => {
    vi.useFakeTimers();
    render(<StudioLiveRoomPage onBack={vi.fn()} />);

    fireEvent.click(screen.getAllByLabelText("打开送礼面板")[0]);
    expect(screen.getByLabelText("送礼面板")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Popular" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    fireEvent.click(screen.getByLabelText("Rose，10 coins"));
    fireEvent.click(screen.getByLabelText("送出 Rose ×1"));

    act(() => {
      vi.advanceTimersByTime(680);
    });
    expect(screen.getByLabelText("You 送出礼物")).toBeInTheDocument();
    expect(screen.getByText("已送出 Rose ×1")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("closes gift panel from backdrop", () => {
    render(<StudioLiveRoomPage onBack={vi.fn()} />);

    fireEvent.click(screen.getAllByLabelText("打开送礼面板")[0]);
    fireEvent.click(screen.getByLabelText("关闭送礼面板"));
    expect(screen.queryByLabelText("送礼面板")).not.toBeInTheDocument();
  });
});
