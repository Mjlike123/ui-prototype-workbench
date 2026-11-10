import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ActionPanel, ActionPanelSheet } from "./action-panel";

describe("ActionPanel", () => {
  it("renders description, actions and cancel", () => {
    const onCancel = vi.fn();
    const onAction = vi.fn();

    render(
      <ActionPanel
        description="This is a title that describes the current operation and is optional."
        actions={[
          { id: "a", label: "文字操作" },
          { id: "b", label: "文字操作", tone: "emphasis" },
          { id: "c", label: "删除", tone: "destructive" },
        ]}
        onCancel={onCancel}
        onAction={onAction}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("menuitem")[0]);
    expect(onAction).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("renders toolbar header and footer switch", () => {
    const onConfirm = vi.fn();
    const onChange = vi.fn();

    render(
      <ActionPanel
        header={{
          title: "Screening country",
          confirmLabel: "confirm",
          onConfirm,
        }}
        actions={[{ id: "only", label: "文字操作" }]}
        cancelLabel={undefined}
        footerSwitch={{
          title: "Hidden birthday",
          description: "Showing more info helps make friends",
          checked: true,
          onChange,
        }}
      />,
    );

    expect(screen.getByText("Screening country")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "confirm" }));
    expect(onConfirm).toHaveBeenCalled();
    expect(screen.getByRole("switch")).toBeChecked();
  });
});

describe("ActionPanelSheet", () => {
  it("calls onDismiss for backdrop when dismissible", () => {
    const onDismiss = vi.fn();

    render(
      <ActionPanelSheet
        open
        dismissible
        onDismiss={onDismiss}
        description="Panel"
        actions={[{ id: "a", label: "Action" }]}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "关闭" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("dismisses after an action by default", () => {
    const onDismiss = vi.fn();
    const onPress = vi.fn();
    render(
      <ActionPanelSheet
        open
        onDismiss={onDismiss}
        description="Panel"
        actions={[{ id: "a", label: "Action", onPress }]}
      />,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Action" }));
    expect(onPress).toHaveBeenCalledOnce();
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("can keep the sheet open when an action presents a child layer", () => {
    const onDismiss = vi.fn();
    render(
      <ActionPanelSheet
        open
        closeOnAction={false}
        onDismiss={onDismiss}
        description="Panel"
        actions={[{ id: "a", label: "Open child" }]}
      />,
    );

    fireEvent.click(screen.getByRole("menuitem", { name: "Open child" }));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("unmounts after exit phase when open becomes false", async () => {
    const { rerender } = render(
      <ActionPanelSheet
        open
        description="Panel"
        actions={[{ id: "a", label: "Action" }]}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    rerender(
      <ActionPanelSheet
        open={false}
        description="Panel"
        actions={[{ id: "a", label: "Action" }]}
        onCancel={vi.fn()}
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
