import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrototypeDestinationPage } from "./prototype-destination-page";

describe("PrototypeDestinationPage", () => {
  it("renders Room interactions and routes through bottom navigation", () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <PrototypeDestinationPage screen="room" onNavigate={onNavigate} />,
    );

    expect(screen.getByRole("heading", { name: "Room" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "KSA" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Popular" }));
    expect(screen.getByRole("tab", { name: "Popular" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      screen.getByRole("button", { name: /Riyadh rank partners/ }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-system-icon="voiceStatus"].prototypeRoomVoiceIcon',
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Feed" }));
    expect(onNavigate).toHaveBeenCalledWith("feed");
  });

  it("passes wide viewport width through room layout tokens", () => {
    const { container } = render(
      <PrototypeDestinationPage
        screen="room"
        width={430}
        height={932}
        onNavigate={vi.fn()}
      />,
    );

    expect(container.querySelector(".prototypeDestinationDevice")).toHaveStyle({
      "--page-canvas-width": "430px",
    });
    expect(container.querySelector(".prototypeRoomList")).toBeInTheDocument();
    expect(container.querySelector(".prototypeRoomRow")).toBeInTheDocument();
  });

  it("renders the Feed design interactions and Message search", () => {
    const onNavigate = vi.fn();
    const onOpenSearch = vi.fn();
    const onOpenCompose = vi.fn();
    const onOpenFeedDetail = vi.fn();
    const { container, rerender } = render(
      <PrototypeDestinationPage
        screen="feed"
        onNavigate={onNavigate}
        onOpenCompose={onOpenCompose}
        onOpenFeedDetail={onOpenFeedDetail}
      />,
    );

    expect(screen.getByRole("tab", { name: "Recommend" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Mine" }));
    expect(screen.getByRole("tab", { name: "Mine" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Latifa Alghanim")).toBeInTheDocument();
    expect(screen.getByLabelText("女性，28 岁")).toBeInTheDocument();
    expect(screen.getByLabelText("会员 V13")).toBeInTheDocument();
    expect(screen.getByLabelText("男性，28 岁")).toBeInTheDocument();
    expect(screen.getByLabelText("会员 V10")).toBeInTheDocument();
    expect(
      container.querySelector('[data-system-icon="notification"]'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-system-icon="like"]')).toHaveLength(
      2,
    );
    expect(
      container.querySelectorAll('[data-system-icon="comment"]'),
    ).toHaveLength(2);
    expect(container.querySelectorAll('[data-system-icon="chat"]')).toHaveLength(
      2,
    );
    fireEvent.click(screen.getByRole("button", { name: "关注 Latifa Alghanim" }));
    expect(
      screen.getByRole("button", { name: "取消关注 Latifa Alghanim" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "发布动态" }));
    expect(onOpenCompose).toHaveBeenCalledOnce();
    fireEvent.click(
      screen.getByRole("button", { name: "查看 Latifa Alghanim 的动态详情" }),
    );
    expect(onOpenFeedDetail).toHaveBeenCalledOnce();

    rerender(
      <PrototypeDestinationPage
        screen="message"
        onNavigate={onNavigate}
        onOpenSearch={onOpenSearch}
      />,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "打开搜索：Search by Name / Userid",
      }),
    );
    expect(onOpenSearch).toHaveBeenCalledOnce();
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(
      screen.getByRole("heading", { name: "online friends" }),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-system-icon="contacts"]'),
    ).toBeInTheDocument();
    const onlineBadges = container.querySelectorAll(".avatarVisualBadge--online");
    expect(onlineBadges).toHaveLength(4);
    onlineBadges.forEach((badge) => {
      expect(
        badge.querySelector('img[src*="avatar-badges/online-dot.svg"]'),
      ).not.toBeNull();
    });
    expect(
      screen.getByRole("button", { name: /❤️i980🌹Wo/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Candy/ })).toBeInTheDocument();
  });

  it("shows more online friends on wide message viewports", () => {
    const { container } = render(
      <PrototypeDestinationPage
        screen="message"
        width={430}
        height={932}
        onNavigate={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Cassie" }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll(".avatarVisualBadge--online")).toHaveLength(
      5,
    );
    expect(screen.getByRole("button", { name: "7 more" })).toBeInTheDocument();
  });
});
