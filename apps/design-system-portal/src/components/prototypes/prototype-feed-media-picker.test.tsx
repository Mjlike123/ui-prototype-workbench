import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  FEED_CAMERA_CAPTURE,
  PrototypeFeedMediaPicker,
} from "./prototype-feed-media-picker";

describe("PrototypeFeedMediaPicker", () => {
  it("adds photos from the album flow", () => {
    const onAddPhotos = vi.fn();
    const onClose = vi.fn();
    render(
      <PrototypeFeedMediaPicker
        open
        selected={[]}
        onAddPhotos={onAddPhotos}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "从相册选择" }));
    fireEvent.click(
      screen.getByRole("button", { name: "选择 Latifa pool" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    expect(onAddPhotos).toHaveBeenCalledWith([
      "/prototypes/feed/latifa-photo.png",
    ]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("captures a photo from the camera flow", () => {
    vi.useFakeTimers();
    const onAddPhotos = vi.fn();
    render(
      <PrototypeFeedMediaPicker
        open
        selected={[]}
        onAddPhotos={onAddPhotos}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "拍照" }));
    fireEvent.click(screen.getByRole("button", { name: "允许" }));
    fireEvent.click(screen.getByRole("button", { name: "拍摄照片" }));
    vi.advanceTimersByTime(500);

    expect(onAddPhotos).toHaveBeenCalledWith([FEED_CAMERA_CAPTURE]);
    vi.useRealTimers();
  });

  it("blocks selection when the post is already full", () => {
    render(
      <PrototypeFeedMediaPicker
        open
        selected={[
          "/prototypes/feed/latifa-photo.png",
          "/prototypes/profile-v3/feed-avatar.png",
          "/prototypes/message/conversation-1.png",
          "/prototypes/message/conversation-2.png",
        ]}
        onAddPhotos={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("已达上限，请先移除已选图片")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "从相册选择" })).toBeDisabled();
  });
});
