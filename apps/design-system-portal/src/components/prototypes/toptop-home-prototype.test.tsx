import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopTopHomePrototype } from "./toptop-home-prototype";

describe("TopTopHomePrototype", () => {
  it("renders the Figma-referenced home modules and action feedback", () => {
    const { container } = render(<TopTopHomePrototype />);

    expect(
      screen.getByRole("heading", { name: "Join friends" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Game" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "find Friend" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".topTopSuggestionBadges .listTag")).toHaveLength(
      6,
    );
    expect(screen.getByLabelText("会员 V10")).toBeInTheDocument();
    expect(screen.getByLabelText("女性，28 岁")).toBeInTheDocument();
    expect(container.querySelector(".topTopSuggestionAvatar i")).toBeNull();

    const jackaroo = screen.getByRole("button", { name: "打开 Jackaroo" });
    expect(jackaroo.querySelector("img")?.getAttribute("src")).toContain(
      "game-jackaroo-v2.png",
    );
    fireEvent.click(jackaroo);
    expect(screen.getByRole("status")).toHaveTextContent("启动 Jackaroo");

    const header = container.querySelector(".topTopHomeHeader");
    const scroll = container.querySelector(".topTopHomeScroll");
    expect(scroll).not.toContainElement(header);
    expect(header?.parentElement).toBe(scroll?.parentElement);
  });

  it("switches destinations through the bottom navigation", () => {
    render(<TopTopHomePrototype />);

    fireEvent.click(screen.getByRole("button", { name: "Room" }));
    expect(screen.getByRole("heading", { name: "Room" })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "返回 TopTop" }));
    expect(
      screen.getByRole("heading", { name: "TopTop 首页" }),
    ).toBeInTheDocument();
  });

  it("opens the search secondary page from the header", () => {
    const onOpenSearch = vi.fn();
    render(<TopTopHomePrototype onOpenSearch={onOpenSearch} />);

    fireEvent.click(screen.getByRole("button", { name: "搜索" }));
    expect(onOpenSearch).toHaveBeenCalledOnce();
  });

  it("accepts wide viewport width for layout adaptation tokens", () => {
    const { container } = render(
      <TopTopHomePrototype width={430} height={932} />,
    );

    expect(container.querySelector(".topTopHomeDevice")).toHaveStyle({
      "--page-canvas-width": "430px",
    });
    expect(
      screen.getByRole("button", { name: "打开 Susan" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "打开 7 More" })).toBeInTheDocument();
    expect(container.querySelectorAll(".topTopFriend:not(.topTopFriend--more)")).toHaveLength(
      5,
    );
  });
});
