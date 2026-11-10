import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublishStatusNotification } from "./publish-status-notification";

describe("PublishStatusNotification", () => {
  it("renders uploading state with progress", () => {
    render(
      <PublishStatusNotification
        status="uploading"
        thumbnailSrc="/prototypes/feed/latifa-photo.png"
        progress={36}
      />,
    );

    expect(screen.getByRole("status", { name: "uploading..." }))
      .toBeInTheDocument();
    expect(screen.getByText("uploading...")).toBeInTheDocument();
    expect(
      document.querySelector(".kitPublishStatusNotificationProgressFill"),
    ).toHaveStyle({ width: "36%" });
  });

  it("renders failed state with retry and dismiss actions", () => {
    const onRetry = vi.fn();
    const onDismiss = vi.fn();

    render(
      <PublishStatusNotification
        status="failed"
        thumbnailPlaceholder="4517 Washington Ave."
        onRetry={onRetry}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "重试发布" }));
    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onRetry).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders success message", () => {
    render(
      <PublishStatusNotification
        status="success"
        thumbnailSrc="/prototypes/feed/latifa-photo.png"
      />,
    );

    expect(screen.getByText("发布成功！")).toBeInTheDocument();
  });
});
