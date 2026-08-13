import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MeSecondaryPrototype } from "./me-secondary-prototypes";

describe("MeSecondaryPrototype", () => {
  it("shows guideline details and returns to Me", () => {
    const onBack = vi.fn();
    render(
      <MeSecondaryPrototype
        screen="community-guidelines"
        onBack={onBack}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Enforcement and appeals" }),
    );
    expect(
      screen.getByText(/We may remove content or limit accounts/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("filters help topics and provides a recovery action", () => {
    render(<MeSecondaryPrototype screen="help" onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "打开搜索：Search help" }),
    );
    fireEvent.change(screen.getByRole("searchbox", { name: "搜索关键词" }), {
      target: { value: "unmatched phrase" },
    });
    expect(screen.getByText("No matching help topic")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(
      screen.getByRole("button", { name: "How do I change my profile?" }),
    ).toBeInTheDocument();
  });

  it("updates settings and uses light status content in dark mode", () => {
    const { container } = render(
      <MeSecondaryPrototype
        screen="settings"
        theme="dark"
        onBack={vi.fn()}
      />,
    );
    const notifications = screen.getByRole("switch", {
      name: /Push notifications/,
    });

    expect(notifications).toBeChecked();
    fireEvent.click(notifications);
    expect(notifications).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: /Direct messages/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Direct messages settings opened",
    );
    expect(container.querySelector(".iosStatusBar")).toHaveClass(
      "iosStatusBar--light-content",
    );
  });
});
