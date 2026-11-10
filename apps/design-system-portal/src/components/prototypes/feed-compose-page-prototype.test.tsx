import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeedComposePagePrototype } from "./feed-compose-page-prototype";
import {
  loadFeedComposeDraft,
  readPublishedFeedPosts,
} from "@/lib/feed-compose-session";
import { readFeedPublishJob } from "@/lib/feed-publish-status";

describe("FeedComposePagePrototype", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("requires content before posting and returns on back when empty", () => {
    const onBack = vi.fn();
    render(<FeedComposePagePrototype onBack={onBack} />);

    expect(document.querySelector(".regularNavigation")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "New post" }),
    ).toBeInTheDocument();
    expect(document.querySelector(".feedComposeHeader")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发布动态" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "关闭" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("prompts before leaving when draft content exists", () => {
    const onBack = vi.fn();
    render(<FeedComposePagePrototype onBack={onBack} />);

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Draft post" },
    });
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Save this draft?");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(loadFeedComposeDraft()?.caption).toBe("Draft post");
  });

  it("starts publish job, returns immediately, and leaves feed to show status", async () => {
    const onPublished = vi.fn();
    render(
      <FeedComposePagePrototype onBack={vi.fn()} onPublished={onPublished} />,
    );

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Late night swim #OOTD" },
    });
    expect(screen.getByRole("button", { name: "发布动态" })).toBeEnabled();

    fireEvent.click(
      screen.getByRole("button", { name: "添加照片，还可添加 9 张" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "选择 app-login-hero-0" }));
    fireEvent.click(screen.getByRole("button", { name: "Done (1)" }));
    expect(screen.getByLabelText("已选图片 1 张，还可添加 8 张")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发布动态" }));
    expect(onPublished).toHaveBeenCalledOnce();
    expect(readFeedPublishJob()).toMatchObject({
      phase: "uploading",
      caption: "Late night swim #OOTD",
      thumbnail: "/prototypes/studio/app-login-hero.jpg",
    });
    expect(readPublishedFeedPosts()).toHaveLength(0);
    expect(loadFeedComposeDraft()).toBeNull();
  });

  it("opens the album picker directly from the add button", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "添加照片，还可添加 9 张" }),
    );

    expect(screen.getByRole("button", { name: "相册：Recents" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done (0)" })).toBeDisabled();
  });

  it("opens audience sheet from visibility pill", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "可见范围：公开" }),
    );
    expect(
      screen.getByRole("heading", { name: "Who can see this post" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Friends only" }));
    expect(
      screen.getByRole("button", { name: "可见范围：好友" }),
    ).toBeInTheDocument();
  });

  it("keeps the audience sheet mounted for its exit motion", () => {
    vi.useFakeTimers();
    const { container } = render(
      <FeedComposePagePrototype onBack={vi.fn()} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "可见范围：公开" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "关闭可见范围设置" }),
    );

    expect(container.querySelector(".feedComposeOverlay")).toHaveAttribute(
      "data-state",
      "exit",
    );
    act(() => vi.advanceTimersByTime(200));
    expect(
      container.querySelector(".feedComposeOverlay"),
    ).not.toBeInTheDocument();
  });

  it("inserts hashtags from dock and topic chips", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "插入话题标签" }));
    expect(screen.getByLabelText("动态文案")).toHaveValue("#OOTD");

    fireEvent.click(screen.getAllByRole("button", { name: "插入 #OOTD" })[0]);
    expect(screen.getByLabelText("动态文案")).toHaveValue("#OOTD #OOTD");
  });

  it("toggles local pill", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    const localControl = screen.getByRole("checkbox", { name: "Local 定位" });
    expect(localControl).toBeChecked();
    fireEvent.click(localControl);
    expect(localControl).not.toBeChecked();
  });

  it("restores saved drafts on mount", async () => {
    window.sessionStorage.setItem(
      "toptop-feed-compose-draft-v1",
      JSON.stringify({
        caption: "Saved draft",
        media: [],
        audience: "friends",
        updatedAt: Date.now(),
      }),
    );

    render(<FeedComposePagePrototype onBack={vi.fn()} />);
    expect(screen.getByLabelText("动态文案")).toHaveValue("Saved draft");
    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveClass("kitToast");
      expect(screen.getByRole("status")).toHaveTextContent("已恢复草稿");
    });
  });
});
