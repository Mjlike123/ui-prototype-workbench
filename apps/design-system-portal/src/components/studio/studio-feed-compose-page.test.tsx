import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioFeedComposePage } from "./studio-feed-compose-page";

describe("StudioFeedComposePage", () => {
  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("uses studio shell with shared feed compose Kit layout", () => {
    render(<StudioFeedComposePage onBack={vi.fn()} />);

    expect(
      document.querySelector(".studioFeedComposeDevice"),
    ).toBeInTheDocument();
    expect(document.querySelector(".feedComposeDevice")).not.toBeInTheDocument();
    expect(document.querySelector(".feedComposeScroll")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "New post" })).toBeInTheDocument();
    expect(screen.getByLabelText("添加照片")).toHaveTextContent("Photo");
    expect(screen.getByLabelText("插入话题标签")).toHaveTextContent("Hashtag");
  });

  it("publishes and calls onPublished after loading state", () => {
    vi.useFakeTimers();
    const onPublished = vi.fn();
    render(
      <StudioFeedComposePage onBack={vi.fn()} onPublished={onPublished} />,
    );

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Hello studio" },
    });
    fireEvent.click(screen.getByLabelText("发布动态"));
    expect(screen.getByLabelText("发布中")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1420);
    });
    expect(onPublished).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("shows leave sheet instead of discarding draft on back", () => {
    render(<StudioFeedComposePage onBack={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Draft text" },
    });
    fireEvent.click(screen.getByLabelText("返回"));

    expect(screen.getByRole("heading", { name: "Save this post?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save draft" })).toHaveClass(
      "kitButton",
    );
  });
});
