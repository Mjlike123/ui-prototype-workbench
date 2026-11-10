import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrototypeFeedMediaPicker } from "./prototype-feed-media-picker";

describe("PrototypeFeedMediaPicker", () => {
  it("opens the album page directly and adds selected photos", () => {
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

    expect(screen.getByRole("button", { name: "相册：Recents" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "选择 app-login-hero-0" }));
    fireEvent.click(screen.getByRole("button", { name: "Done (1)" }));

    expect(onAddPhotos).toHaveBeenCalledWith([
      "/prototypes/studio/app-login-hero.jpg",
    ]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes from the backdrop", () => {
    const onClose = vi.fn();
    render(
      <PrototypeFeedMediaPicker
        open
        selected={[]}
        onAddPhotos={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "关闭相册选择层" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("keeps the page mounted while the exit motion completes", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(
      <PrototypeFeedMediaPicker
        open
        selected={[]}
        onAddPhotos={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    rerender(
      <PrototypeFeedMediaPicker
        open={false}
        selected={[]}
        onAddPhotos={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      container.querySelector(".feedComposePhotoPickerOverlay"),
    ).toHaveAttribute("data-state", "exit");

    act(() => vi.advanceTimersByTime(320));
    expect(
      container.querySelector(".feedComposePhotoPickerOverlay"),
    ).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("only keeps one draft photo selected at a time", () => {
    const onAddPhotos = vi.fn();
    render(
      <PrototypeFeedMediaPicker
        open
        selected={[]}
        onAddPhotos={onAddPhotos}
        onClose={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "选择 app-login-hero-0" }));
    fireEvent.click(screen.getByRole("button", { name: "选择 spin-bottle-booth-1" }));
    fireEvent.click(screen.getByRole("button", { name: "Done (1)" }));

    expect(onAddPhotos).toHaveBeenCalledWith([
      "/prototypes/studio/spin-bottle-booth.jpg",
    ]);
  });

  it("does not render when the post is already full", () => {
    const { container } = render(
      <PrototypeFeedMediaPicker
        open
        maxCount={9}
        selected={[
          "/prototypes/feed/latifa-photo.png",
          "/prototypes/profile-v3/feed-avatar.png",
          "/prototypes/message/conversation-1.png",
          "/prototypes/message/conversation-2.png",
          "/prototypes/message/conversation-3.png",
          "/prototypes/message/online-1.png",
          "/prototypes/message/group-1.png",
          "/prototypes/profile-v3/supporter-card.png",
          "/prototypes/message/conversation-4.png",
        ]}
        onAddPhotos={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
