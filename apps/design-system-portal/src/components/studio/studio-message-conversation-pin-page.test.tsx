import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioMessageConversationPinPage } from "./studio-message-conversation-pin-page";

describe("StudioMessageConversationPinPage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the initial pinned conversation with visual and accessible state", () => {
    render(<StudioMessageConversationPinPage />);

    expect(
      screen.getByRole("button", {
        name: /Latifa，已置顶，The new photos look great!/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("PINNED")).toBeInTheDocument();
  });

  it("opens an animated bubble menu when the navigation plus is clicked", () => {
    vi.useFakeTimers();
    render(<StudioMessageConversationPinPage />);

    const trigger = screen.getByRole("button", { name: "创建新消息" });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("dialog", { name: "消息快捷菜单" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "创建群聊" }),
    ).toHaveFocus();
    expect(
      screen.getByRole("menuitem", { name: "添加朋友" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "关闭消息快捷菜单" }),
    ).toHaveClass("studioMessageQuickMenuBackdrop");

    fireEvent.click(screen.getByRole("menuitem", { name: "创建群聊" }));
    expect(document.querySelector(".studioMessageQuickMenuLayer")).toHaveClass(
      "studioMessageQuickMenuLayer--closing",
    );
    act(() => vi.advanceTimersByTime(160));

    expect(
      screen.queryByRole("dialog", { name: "消息快捷菜单" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("创建群聊")).toBeInTheDocument();
  });

  it("reveals the pin action on left swipe and moves the conversation first", () => {
    render(<StudioMessageConversationPinPage />);

    const andrew = screen.getByRole("button", {
      name: /Andrew，I’ll send the notes today/,
    });
    const surface = andrew.closest(".studioMessagePinRowSurface");
    expect(surface).not.toBeNull();

    fireEvent.pointerDown(surface!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 220,
      clientY: 260,
    });
    fireEvent.pointerMove(surface!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 262,
    });
    fireEvent.pointerUp(surface!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 262,
    });

    fireEvent.click(screen.getByRole("button", { name: "Pin Andrew" }));

    expect(
      screen.getByRole("button", {
        name: /Andrew，已置顶，I’ll send the notes today/,
      }),
    ).toBeInTheDocument();
    const rows = document.querySelectorAll(
      ".studioMessagePinList .regularListMain",
    );
    expect(rows[0]).toHaveTextContent("Andrew");
    expect(screen.getByText("已置顶 Andrew")).toBeInTheDocument();
  });

  it("offers the same reversible action from the long-press menu", () => {
    vi.useFakeTimers();
    render(<StudioMessageConversationPinPage />);

    const candy = screen.getByRole("button", {
      name: /Candy，See you there/,
    });
    const surface = candy.closest(".studioMessagePinRowSurface");
    expect(surface).not.toBeNull();

    fireEvent.pointerDown(surface!, {
      pointerId: 2,
      pointerType: "touch",
      clientX: 180,
      clientY: 520,
    });
    act(() => vi.advanceTimersByTime(520));

    expect(
      screen.getByRole("dialog", { name: "Candy 会话操作" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Pin" }));

    expect(
      screen.getByRole("button", {
        name: /Candy，已置顶，See you there/,
      }),
    ).toBeInTheDocument();
  });

  it("reveals pin and delete actions on left swipe and deletes a conversation", () => {
    render(<StudioMessageConversationPinPage />);

    const candy = screen.getByRole("button", {
      name: /Candy，See you there/,
    });
    const surface = candy.closest(".studioMessagePinRowSurface");
    expect(surface).not.toBeNull();

    fireEvent.pointerDown(surface!, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 220,
      clientY: 520,
    });
    fireEvent.pointerMove(surface!, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 60,
      clientY: 520,
    });
    fireEvent.pointerUp(surface!, {
      pointerId: 3,
      pointerType: "touch",
      clientX: 60,
      clientY: 520,
    });

    fireEvent.click(screen.getByRole("button", { name: "Delete Candy" }));
    expect(
      screen.queryByRole("button", { name: /Candy，See you there/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("已删除 Candy")).toBeInTheDocument();
  });

  it("does not expose pin actions for system notifications", () => {
    render(<StudioMessageConversationPinPage />);

    const systemConversation = screen.getByRole("button", {
      name: /TopTop notifications，Your account safety report is ready/,
    });
    const surface = systemConversation.closest(".studioMessagePinRowSurface");
    expect(surface).not.toBeNull();

    fireEvent.contextMenu(surface!);

    expect(
      screen.queryByRole("dialog", { name: /TopTop notifications/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pin TopTop notifications" }),
    ).not.toBeInTheDocument();
  });
});
