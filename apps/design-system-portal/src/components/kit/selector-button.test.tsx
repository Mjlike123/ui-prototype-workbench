import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SelectorButton } from "./selector-button";

describe("SelectorButton", () => {
  it("toggles selected state and respects disabled", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <SelectorButton
        selected={false}
        onChange={onChange}
        aria-label="Local"
      />,
    );

    const control = screen.getByRole("checkbox", { name: "Local" });
    expect(control).not.toBeChecked();

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <SelectorButton
        selected
        disabled
        onChange={onChange}
        aria-label="Local"
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Local" })).toBeDisabled();
  });

  it("applies compact size class for 20px visual with 24px hit target", () => {
    render(
      <SelectorButton
        selected={false}
        size="compact"
        onChange={vi.fn()}
        aria-label="Local"
      />,
    );

    const control = screen.getByRole("checkbox", { name: "Local" });
    expect(control).toHaveClass("kitSelectorButton--compact");
  });

  it("uses radio semantics for a single-selection group", () => {
    const onChange = vi.fn();
    render(
      <SelectorButton
        selected={false}
        selectionMode="single"
        name="report-reason"
        onChange={onChange}
        aria-label="Harassment"
      />,
    );

    const control = screen.getByRole("radio", { name: "Harassment" });
    expect(control).toHaveAttribute("name", "report-reason");
    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
