import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles checked state and respects disabled", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Switch
        checked={false}
        onChange={onChange}
        aria-label="Notifications"
      />,
    );

    const control = screen.getByRole("switch", { name: "Notifications" });
    expect(control).not.toBeChecked();

    fireEvent.click(control);
    expect(onChange).toHaveBeenCalledWith(true);

    rerender(
      <Switch
        checked
        disabled
        onChange={onChange}
        aria-label="Notifications"
      />,
    );
    expect(screen.getByRole("switch", { name: "Notifications" })).toBeDisabled();
  });
});
