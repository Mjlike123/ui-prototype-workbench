import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MePagePrototype } from "./me-page-prototype";

describe("MePagePrototype", () => {
  it("shows the Me function list beside Profile on iPhone Duo inner canvas", () => {
    const { container } = render(
      <MePagePrototype width={890} height={626} />,
    );

    expect(
      container.querySelector(".prototypePrimaryDuo--inner"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("我的功能")).toBeInTheDocument();
    expect(screen.getByLabelText("Activity")).toBeInTheDocument();
    expect(screen.getByLabelText("Account and benefits")).toBeInTheDocument();
    expect(
      screen.getByRole("complementary", { name: "个人资料" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Andrew" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "返回" })).toBeNull();
    expect(container.querySelector(".meIdentityHeader")).toBeNull();
    const tabBar = screen.getByRole("navigation", { name: "App 一级目的地" });
    expect(tabBar).toHaveClass("bottomNavigation--vertical");
    expect(screen.getByLabelText("我的功能")).not.toContainElement(tabBar);
    expect(
      screen.getByRole("complementary", { name: "个人资料" }),
    ).not.toContainElement(tabBar);
  });

  it("opens Profile from the full top identity area", () => {
    const onOpenProfile = vi.fn();
    render(<MePagePrototype onOpenProfile={onOpenProfile} />);

    fireEvent.click(screen.getByRole("button", { name: "打开个人资料" }));
    expect(onOpenProfile).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("女性")).toBeInTheDocument();
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
