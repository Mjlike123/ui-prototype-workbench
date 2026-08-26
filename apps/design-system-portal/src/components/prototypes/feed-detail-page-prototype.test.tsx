import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedDetailPagePrototype } from "./feed-detail-page-prototype";

describe("FeedDetailPagePrototype", () => {
  it("renders post, comments tab, and kit navigation", () => {
    render(<FeedDetailPagePrototype onBack={vi.fn()} />);

    expect(screen.getByText("Latifa Alghanim")).toBeInTheDocument();
    expect(screen.getAllByText(/#OOTD/).length).toBeGreaterThan(0);
    expect(screen.getByRole("tab", { name: "Comments" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByText("Beautiful dress, where did you buy it?"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/reply to Latifa/i)).toBeInTheDocument();
    expect(screen.getByLabelText("返回")).toBeInTheDocument();
  });

  it("opens reply composer in keyboard mode from the reply field", () => {
    render(<FeedDetailPagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByPlaceholderText(/reply to Latifa/i));

    expect(screen.getByLabelText("发送回复")).toBeInTheDocument();
    expect(screen.queryByLabelText("表情面板")).not.toBeInTheDocument();
    expect(screen.getByLabelText("选择表情")).toBeInTheDocument();
    expect(screen.queryByLabelText("私聊")).not.toBeInTheDocument();
  });

  it("toggles emoji panel and keyboard icon in reply composer", () => {
    render(<FeedDetailPagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByPlaceholderText(/reply to Latifa/i));
    fireEvent.click(screen.getByLabelText("选择表情"));

    expect(screen.getByLabelText("切换到键盘")).toBeInTheDocument();
    expect(screen.getByLabelText("关闭表情面板")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("切换到键盘"));
    expect(screen.getByLabelText("选择表情")).toBeInTheDocument();
    expect(screen.queryByLabelText("关闭表情面板")).not.toBeInTheDocument();
  });

  it("closes emoji panel when tapping the blank dismiss layer", () => {
    render(<FeedDetailPagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByPlaceholderText(/reply to Latifa/i));
    fireEvent.click(screen.getByLabelText("选择表情"));
    expect(screen.getByLabelText("关闭表情面板")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("关闭表情面板"));
    expect(screen.queryByLabelText("关闭表情面板")).not.toBeInTheDocument();
    expect(screen.getByLabelText("选择表情")).toBeInTheDocument();
  });

  it("returns to feed on back and switches to like tab", () => {
    const onBack = vi.fn();
    render(<FeedDetailPagePrototype onBack={onBack} />);

    fireEvent.click(screen.getByRole("tab", { name: "Like" }));
    expect(screen.getByText("Like list coming soon")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("返回"));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
