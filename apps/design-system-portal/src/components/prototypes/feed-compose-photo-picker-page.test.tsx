import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedComposePhotoPickerPage } from "./feed-compose-photo-picker-page";

describe("FeedComposePhotoPickerPage", () => {
  it("renders recents grid and confirms selected photos", () => {
    const onToggle = vi.fn();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <FeedComposePhotoPickerPage
        selected={[]}
        draftSelection={["/prototypes/studio/app-login-hero.jpg"]}
        remainingSlots={8}
        onToggle={onToggle}
        onConfirm={onConfirm}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("navigation", { name: "相册导航" })).toHaveClass(
      "regularNavigation",
    );
    expect(screen.getByRole("button", { name: "相册：Recents" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Done (1)" })).toBeEnabled();

    fireEvent.click(screen.getByRole("button", { name: "Done (1)" }));
    expect(onConfirm).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "关闭相册" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("requires exactly one selected photo before confirming", () => {
    render(
      <FeedComposePhotoPickerPage
        selected={[]}
        draftSelection={[]}
        remainingSlots={9}
        onToggle={vi.fn()}
        onConfirm={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Done (0)" })).toBeDisabled();
  });
});
