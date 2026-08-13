import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders illustration, description, and optional action", () => {
    const onAction = vi.fn();
    const { container, rerender } = render(
      <EmptyState
        illustration="no-list"
        description="Please fill in the country first"
        actionLabel="Go set"
        onAction={onAction}
      />,
    );

    expect(
      screen.getByText("Please fill in the country first"),
    ).toBeInTheDocument();
    expect(
      container.querySelector(".emptyStateKitIllustration")?.getAttribute("src"),
    ).toContain("no-list.png");
    fireEvent.click(screen.getByRole("button", { name: "Go set" }));
    expect(onAction).toHaveBeenCalledOnce();

    rerender(
      <EmptyState
        illustration="no-network"
        description="No results yet"
        aria-label="列表为空"
      />,
    );
    expect(
      container.querySelector(".emptyStateKitIllustration")?.getAttribute("src"),
    ).toContain("no-network.png");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByLabelText("列表为空")).toBeInTheDocument();
  });
});
