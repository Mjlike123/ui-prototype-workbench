import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioMomentPublishDetailPage } from "./studio-moment-publish-detail-page";

describe("StudioMomentPublishDetailPage", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("connects the Moment FAB to the Core feed composer", () => {
    render(<StudioMomentPublishDetailPage />);

    expect(
      screen.getByLabelText("查看 Andrew 的动态详情").closest(
        ".prototypeFeedBody",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("发布动态"));

    expect(document.querySelector(".feedComposeDevice")).toBeInTheDocument();
    expect(
      document.querySelector(".studioFeedComposeDevice"),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("添加图片")).toBeInTheDocument();
    expect(screen.getByLabelText("添加话题")).toBeInTheDocument();
  });

  it("restores a failed post draft before editing", () => {
    render(<StudioMomentPublishDetailPage />);

    fireEvent.click(
      screen.getByRole("button", { name: /Post failed/i }),
    );

    expect(screen.getByLabelText("动态文案")).toHaveValue(
      "Morning workout — every small step counts.",
    );
    expect(screen.getByRole("status")).toHaveTextContent("已恢复草稿");
  });

  it("exposes self and closed-region detail variants", () => {
    render(<StudioMomentPublishDetailPage />);
    fireEvent.click(screen.getByRole("tab", { name: "动态详情" }));

    fireEvent.click(screen.getByRole("tab", { name: "本人动态" }));
    expect(
      document.querySelector(".studioMomentDetail--self"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "ME / KSA" }));
    expect(
      document.querySelector(".studioMomentDetail--closed-region"),
    ).toBeInTheDocument();
  });
});
