import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CenterDialog } from "./center-dialog";

describe("CenterDialog", () => {
  it("renders horizontal actions and handles primary press", () => {
    const onDiscard = vi.fn();
    const onSave = vi.fn();

    render(
      <CenterDialog
        open
        title="Save this draft?"
        description="Your draft will stay on this device."
        dismissible
        onDismiss={vi.fn()}
        actions={[
          { id: "discard", label: "Discard", tone: "neutral", onPress: onDiscard },
          { id: "save", label: "Save", tone: "primary", onPress: onSave },
        ]}
        actionLayout="horizontal"
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Save this draft?");
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalled();
  });

  it("calls onDismiss for backdrop when dismissible", () => {
    const onDismiss = vi.fn();

    render(
      <CenterDialog
        open
        title="Save this draft?"
        dismissible
        onDismiss={onDismiss}
        actions={[{ id: "ok", label: "Save", tone: "primary" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("does not render backdrop button when not dismissible", () => {
    render(
      <CenterDialog
        open
        title="Alert"
        actions={[{ id: "ok", label: "I see", tone: "primary" }]}
      />,
    );

    expect(screen.queryByRole("button", { name: "关闭" })).not.toBeInTheDocument();
  });

  it("unmounts after exit phase when open becomes false", async () => {
    const { rerender } = render(
      <CenterDialog
        open
        title="Save this draft?"
        actions={[{ id: "save", label: "Save", tone: "primary" }]}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(
      <CenterDialog
        open={false}
        title="Save this draft?"
        actions={[{ id: "save", label: "Save", tone: "primary" }]}
      />,
    );

    await waitFor(
      () => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      },
      { timeout: 500 },
    );
  });
});
