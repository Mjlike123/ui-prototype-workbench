import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./app-shell";

const route = vi.hoisted(() => ({ pathname: "/interactions/tab-selection" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

const interactionTabs = [
  "bottom-navigation-selection",
  "bottom-sheet-behavior",
  "button-press",
  "primary-navigation-selection",
  "regular-list-action",
  "regular-navigation-actions",
  "search-control-input",
  "tab-selection",
].map((id) => ({
  href: `/interactions/${id}`,
  label: id,
}));

describe("AppShell interaction navigation", () => {
  beforeEach(() => {
    route.pathname = "/interactions/tab-selection";
  });

  it("shows eight interaction pages and marks the current page", () => {
    render(
      <AppShell interactionTabs={interactionTabs}>
        <main>Current interaction</main>
      </AppShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    const current = within(navigation).getByRole("link", {
      name: "tab-selection",
    });

    expect(
      within(navigation).getAllByRole("link").filter((link) =>
        link.getAttribute("href")?.startsWith("/interactions/"),
      ),
    ).toHaveLength(8);
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("supports explicitly collapsing the interaction submenu", () => {
    render(
      <AppShell interactionTabs={interactionTabs}>
        <main>Current interaction</main>
      </AppShell>,
    );

    const toggle = screen.getByRole("button", {
      name: "收起交互与模式",
    });
    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      document.getElementById("interaction-drawer-tabs"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("shows visual inspection as a secondary audit destination", () => {
    route.pathname = "/audit/visual";
    render(
      <AppShell interactionTabs={interactionTabs}>
        <main>Visual inspection</main>
      </AppShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    const current = within(navigation).getByRole("link", {
      name: "视觉走查工作台",
    });
    expect(current).toHaveAttribute("href", "/audit/visual");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: "收起验收中心" }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  it("shows prototype preview drawer with core and studio destinations", () => {
    route.pathname = "/canvas/core";
    render(
      <AppShell interactionTabs={interactionTabs}>
        <main>Core templates</main>
      </AppShell>,
    );

    const navigation = screen.getByRole("navigation", { name: "主导航" });
    const core = within(navigation).getByRole("link", { name: "核心模块" });
    const studio = within(navigation).getByRole("link", { name: "原型创作" });

    expect(core).toHaveAttribute("href", "/canvas/core");
    expect(core).toHaveAttribute("aria-current", "page");
    expect(studio).toHaveAttribute("href", "/canvas/studio");
    expect(
      screen.getByRole("button", { name: "收起原型预览" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
