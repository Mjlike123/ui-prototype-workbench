import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegularNavigation } from "./regular-navigation";

describe("RegularNavigation", () => {
  it("renders a centered title and exposes back behavior", () => {
    const onBack = vi.fn();
    render(
      <RegularNavigation
        title="Help"
        subtitle="Support"
        onBack={onBack}
      />,
    );

    expect(
      screen.getByRole("navigation", { name: "二级页面导航" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Help" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
