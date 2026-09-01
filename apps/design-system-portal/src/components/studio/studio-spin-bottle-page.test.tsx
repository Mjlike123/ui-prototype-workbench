import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioSpinBottlePage } from "./studio-spin-bottle-page";

describe("StudioSpinBottlePage", () => {
  it("renders circular spin bottle room shell", () => {
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    expect(
      document.querySelector(".studioSpinBottleDevice"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("围桌麦位")).toBeInTheDocument();
    expect(document.querySelector(".studioSpinBottleRing")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(10);
    expect(screen.getByText("Kiss · Truth Circle")).toBeInTheDocument();
  });

  it("runs spin flow and opens kiss/pass sheet", () => {
    vi.useFakeTimers();
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Spin ♡" }));

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(screen.getByLabelText("Kiss 或 Pass")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kiss" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("pass closes sheet and returns to idle", () => {
    vi.useFakeTimers();
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Spin ♡" }));
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    fireEvent.click(screen.getByRole("button", { name: "Pass" }));

    expect(screen.queryByLabelText("Kiss 或 Pass")).not.toBeInTheDocument();
    expect(screen.getByText("Passed · Next spin")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("switches seat count between 8 and 12", () => {
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    expect(screen.getByLabelText("选择座位数")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(10);

    fireEvent.click(screen.getByRole("button", { name: "12 个座位" }));
    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(12);
    expect(screen.getByText("已切换为 12 麦围桌")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "8 个座位" }));
    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(8);
  });

  it("blocks seat count change while spinning", () => {
    vi.useFakeTimers();
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Spin ♡" }));
    fireEvent.click(screen.getByRole("button", { name: "11 个座位" }));

    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(10);
    expect(
      screen.getByText("玩法进行中 · 结束后再调整席位数"),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});
