import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MePagePrototype } from "./me-page-prototype";

describe("MePagePrototype", () => {
  it("opens Profile from the full top identity area", () => {
    const onOpenProfile = vi.fn();
    render(<MePagePrototype onOpenProfile={onOpenProfile} />);

    fireEvent.click(screen.getByRole("button", { name: "打开个人资料" }));
    expect(onOpenProfile).toHaveBeenCalledOnce();
  });

  it.each([
    ["My wallet", "wallet"],
    ["Community Guidelines", "community-guidelines"],
    ["Help", "help"],
    ["Settings", "settings"],
  ] as const)("opens the %s secondary page", (label, destination) => {
    const onOpenSecondary = vi.fn();
    render(<MePagePrototype onOpenSecondary={onOpenSecondary} />);

    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(onOpenSecondary).toHaveBeenCalledWith(destination);
  });
});
