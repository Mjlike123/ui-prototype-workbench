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

  it("moves the tab bar to the side on the iPhone Duo outer canvas", () => {
    const { container } = render(
      <TopTopHomePrototype width={466} height={678} />,
    );

    const tabBar = screen.getByRole("navigation", { name: "App 一级目的地" });
    expect(tabBar).toHaveClass("bottomNavigation--vertical");
    expect(
      container.querySelector(".pageCanvasContentShell--sideChrome"),
    ).toContainElement(tabBar);
    expect(container.querySelector(".topTopHomeDevice")).toHaveStyle({
      "--duo-reserved-top": "54px",
    });
  });

  it("spreads Join friends evenly across the iPhone Duo outer canvas", () => {
    const { container } = render(
      <TopTopHomePrototype width={466} height={678} />,
    );

    const grid = container.querySelector(".topTopFriendGrid");
    expect(grid).toHaveStyle({
      gridTemplateColumns: "repeat(5, 56px)",
    });
    const gap = Number.parseFloat(grid?.style.gap ?? "0");
    expect(5 * 56 + 4 * gap).toBeCloseTo(434, 1);
    expect(
      container.querySelectorAll(".topTopFriend:not(.topTopFriend--more)"),
    ).toHaveLength(4);
  });

  it("keeps find Friend in the home scroll on iPhone Duo inner canvas", () => {
    const { container } = render(
      <TopTopHomePrototype width={890} height={626} />,
    );

    expect(container.querySelector(".topTopHomeDevice--duoInner")).toBeInTheDocument();
    expect(container.querySelector(".prototypePrimaryDuo--inner")).toBeNull();
    const scroll = container.querySelector(".topTopHomeScroll");
    expect(scroll).toContainElement(
      screen.getByRole("heading", { name: "find Friend" }),
    );
    expect(scroll).toContainElement(
      screen.getByRole("heading", { name: "Game" }),
    );
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

  it("creates a private room through the game selection sheet", () => {
    const onCreatePrivateRoom = vi.fn();
    render(
      <TopTopHomePrototype onCreatePrivateRoom={onCreatePrivateRoom} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Create private room" }),
    );
    expect(
      screen.getByRole("dialog", {
        name: "Choose a game for your private room",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Select Jackaroo" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Start private room" }),
    );

    expect(onCreatePrivateRoom).toHaveBeenCalledWith("Jackaroo");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Jackaroo private room is ready",
    );
    expect(
      screen.getByRole("button", {
        name: "Change Jackaroo private room game",
      }),
    ).toBeInTheDocument();
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
