import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MessageListStatus } from "./message-list-status";
import { RegularListItem } from "./regular-list-item";

describe("message list status", () => {
  it("renders no node for the default status", () => {
    const { container } = render(<MessageListStatus status="default" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the Stranger tag after the title", () => {
    render(<RegularListItem listType="message" title="Hawkins" subtitle="Hello" messageStatus="stranger" />);
    const tag = screen.getByText("Stranger");
    expect(tag.previousElementSibling).toHaveTextContent("Hawkins");
    expect(screen.getByRole("button", { name: "Hawkins，Stranger，Hello" })).toBeVisible();
  });

  it("renders the three existing failure assets and exposes the failure on the row", () => {
    render(<RegularListItem listType="message" title="Hawkins" subtitle="Hello" messageStatus="failed" />);
    const row = screen.getByRole("button", { name: "Hawkins，发送失败，Hello" });
    const icon = within(row).getByRole("img", { name: "发送失败" });
    expect(Array.from(icon.querySelectorAll("img"), (image) => image.getAttribute("src"))).toEqual([
      "/icons/list/failed-circle.svg", "/icons/list/failed-mark.svg", "/icons/list/failed-dot.svg",
    ]);
  });

  it.each([
    ["loading", "发送中", "loading", "16"],
    ["editing", "已编辑", "edit", "18"],
  ] as const)("renders the %s system icon at the specified size", (status, label, name, size) => {
    render(<MessageListStatus status={status} />);
    const icon = screen.getByRole("img", { name: label });
    const systemIcon = icon.querySelector(`[data-system-icon="${name}"]`);
    expect(systemIcon).toHaveStyle({ width: `${size}px`, height: `${size}px` });
  });

  it("renders the gift prefix ahead of the message", () => {
    render(<RegularListItem listType="message" title="Hawkins" subtitle="Hello" messageStatus="gift" />);
    const prefix = screen.getByText("[Gifts]");
    expect(prefix.nextSibling?.textContent).toBe("Hello");
    expect(screen.getByRole("button", { name: "Hawkins，[Gifts]，Hello" })).toBeVisible();
  });
});
