import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FeedComposePagePrototype } from "./feed-compose-page-prototype";
import {
  loadFeedComposeDraft,
  readPublishedFeedPosts,
} from "@/lib/feed-compose-session";

describe("FeedComposePagePrototype", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("requires content before posting and returns on back when empty", () => {
    const onBack = vi.fn();
    render(<FeedComposePagePrototype onBack={onBack} />);

    expect(screen.getByRole("heading", { name: "New post" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发布动态" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("prompts before leaving when draft content exists", () => {
    const onBack = vi.fn();
    render(<FeedComposePagePrototype onBack={onBack} />);

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Draft post" },
    });
    fireEvent.click(screen.getByRole("button", { name: "返回" }));

    expect(screen.getByRole("heading", { name: "Save this post?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));
    expect(onBack).toHaveBeenCalledOnce();
    expect(loadFeedComposeDraft()?.caption).toBe("Draft post");
  });

  it("supports caption, album photos, publish feedback, and feed return", async () => {
    vi.useFakeTimers();
    const onPublished = vi.fn();
    render(
      <FeedComposePagePrototype onBack={vi.fn()} onPublished={onPublished} />,
    );

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "Late night swim #OOTD" },
    });
    expect(screen.getByRole("button", { name: "发布动态" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "添加照片" }));
    fireEvent.click(screen.getByRole("button", { name: "从相册选择" }));
    fireEvent.click(
      screen.getByRole("button", { name: "选择 Latifa pool" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    expect(screen.getByLabelText("已选图片 1 张，还可添加 3 张")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "继续添加照片，还可添加 3 张" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "发布动态" }));
    expect(screen.getByRole("button", { name: "发布中" })).toBeDisabled();

    await act(async () => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByRole("status")).toHaveTextContent("动态已发布");
    expect(readPublishedFeedPosts()[0]?.caption).toBe("Late night swim #OOTD");

    await act(async () => {
      vi.advanceTimersByTime(520);
    });
    expect(onPublished).toHaveBeenCalledOnce();
  });

  it("supports camera capture through permission and media picker", () => {
    vi.useFakeTimers();
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "添加照片" }));
    fireEvent.click(screen.getByRole("button", { name: "拍照" }));
    fireEvent.click(screen.getByRole("button", { name: "允许" }));
    fireEvent.click(screen.getByRole("button", { name: "拍摄照片" }));
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByLabelText("已选图片 1 张，还可添加 3 张")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发布动态" })).toBeEnabled();
  });

  it("shows permission education when camera access is denied", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "添加照片" }));
    fireEvent.click(screen.getByRole("button", { name: "拍照" }));
    fireEvent.click(screen.getByRole("button", { name: "不允许" }));

    expect(screen.getByRole("heading", { name: "无法使用相机" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "从相册选择" }));
    expect(screen.getByRole("heading", { name: "相册" })).toBeInTheDocument();
  });

  it("opens audience sheet instead of inline toggle", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "可见范围：所有人" }),
    );
    expect(screen.getByRole("heading", { name: "Who can reply" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Friends only" }));
    expect(
      screen.getByRole("button", { name: "可见范围：好友" }),
    ).toBeInTheDocument();
  });

  it("inserts hashtags from toolbar", () => {
    render(<FeedComposePagePrototype onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "插入话题标签" }));
    expect(screen.getByLabelText("动态文案")).toHaveValue("#OOTD");
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
      expect(screen.getByRole("status")).toHaveTextContent("已恢复草稿");
    });
  });
});
