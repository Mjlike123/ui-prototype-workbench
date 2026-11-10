import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioSpinBottlePage } from "./studio-spin-bottle-page";

describe("StudioSpinBottlePage", () => {
  it("renders circular spin bottle room shell with cold-start rules", () => {
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    expect(
      document.querySelector(".studioSpinBottleDevice"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("围桌麦位")).toBeInTheDocument();
    expect(document.querySelector(".studioSpinBottleRing")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(10);
    expect(screen.getByText("官方心动房 #01")).toBeInTheDocument();
    expect(screen.getByText("男女专属位")).toBeInTheDocument();
    expect(screen.getByText(/固定房 1\/3/)).toBeInTheDocument();
  });

  it("runs spin flow and opens kiss/pass sheet", () => {
    vi.useFakeTimers();
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "顺时针 Spin ♡" }));

    act(() => {
      vi.advanceTimersByTime(2200);
    });

    expect(screen.getByLabelText("Kiss 或 Pass")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kiss" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("kiss enters truth Q&A then vote with male-only removal rule", () => {
    vi.useFakeTimers();
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "顺时针 Spin ♡" }));
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    fireEvent.click(screen.getByRole("button", { name: "Kiss" }));

    expect(screen.getByLabelText("真心话问答")).toBeInTheDocument();
    expect(screen.getByText("已合规审核")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "回答完毕 · 进入投票" }),
    );
    expect(screen.getByText("公屏投票 · 赞率 >60% 男性留座")).toBeInTheDocument();
    expect(screen.getByText("女性免疫请出")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "👍" }));
    expect(screen.getByText("赞率达标 · 男性留座")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("pass closes sheet and returns to idle", () => {
    vi.useFakeTimers();
    render(<StudioSpinBottlePage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "顺时针 Spin ♡" }));
    act(() => {
      vi.advanceTimersByTime(2200);
    });
    fireEvent.click(screen.getByRole("button", { name: "Pass" }));

    expect(screen.queryByLabelText("Kiss 或 Pass")).not.toBeInTheDocument();
    expect(screen.getByText("已 Pass · 下一位顺时针轮转")).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: "顺时针 Spin ♡" }));
    fireEvent.click(screen.getByRole("button", { name: "11 个座位" }));

    expect(screen.getAllByLabelText(/麦位 \d+/)).toHaveLength(10);
    expect(
      screen.getByText("玩法进行中 · 结束后再调整席位数"),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });
});
