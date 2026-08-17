import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrivateChatPrototype } from "./private-chat-prototype";

const friend = {
  id: "andrew",
  name: "Andrew",
  avatar: "/prototypes/feed/andrew-avatar.png",
};

describe("PrivateChatPrototype", () => {
  it("supports sending a message and returning to Message", () => {
    const onBack = vi.fn();
    render(<PrivateChatPrototype friend={friend} onBack={onBack} />);

    expect(
      screen.getByRole("heading", { name: "Andrew" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Active now")).toBeInTheDocument();
    expect(screen.getAllByText("已读")).toHaveLength(1);
    expect(screen.queryByText("14:23")).not.toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "消息内容" });
    const messageList = screen.getByRole("main", {
      name: "与 Andrew 的消息",
    });
    const scrollTo = vi.fn();
    messageList.scrollTo = scrollTo;
    fireEvent.focus(input);
    expect(scrollTo).toHaveBeenCalledWith({
      top: messageList.scrollHeight,
      behavior: "smooth",
    });
    fireEvent.change(input, { target: { value: "See you there" } });
    fireEvent.submit(screen.getByRole("form", { name: "发送私聊消息" }));
    expect(screen.getByText("See you there")).toBeInTheDocument();
    expect(screen.getAllByText("已读")).toHaveLength(1);
    expect(input).toHaveValue("");

    fireEvent.click(screen.getByRole("button", { name: "返回 Message" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("replies with a quote and locates the original message", () => {
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const message = screen.getByLabelText("Alice 的消息，14:23");
    const column = message.querySelector(".chatBubbleColumn");
    fireEvent.pointerDown(column!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 240,
      button: 0,
    });
    fireEvent.pointerMove(column!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 180,
      clientY: 242,
    });
    fireEvent.pointerUp(column!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 180,
      clientY: 242,
    });

    expect(
      screen.getByRole("region", { name: "正在回复 Alice" }),
    ).toBeInTheDocument();
    const input = screen.getByRole("textbox", { name: "消息内容" });
    fireEvent.change(input, { target: { value: "I’ll send the notes today." } });
    fireEvent.submit(screen.getByRole("form", { name: "发送私聊消息" }));

    const quote = screen.getByRole("button", {
      name: /定位到 Alice 的原消息：Is the UI review/,
    });
    fireEvent.click(quote);
    expect(screen.getByLabelText("Alice 的消息，14:23")).toHaveClass(
      "isHighlighted",
    );
    expect(screen.getByText("已定位到 Alice 的原消息")).toBeInTheDocument();
  });

  it("locates the original message when a quote preview is clicked with the mouse", () => {
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const quote = screen.getByRole("button", {
      name: /定位到 Alice 的原消息：TopTop weekend event/,
    });
    fireEvent.pointerDown(quote, {
      pointerId: 3,
      pointerType: "mouse",
      clientX: 200,
      clientY: 400,
      button: 0,
    });
    fireEvent.pointerUp(quote, {
      pointerId: 3,
      pointerType: "mouse",
      clientX: 200,
      clientY: 400,
      button: 0,
    });
    fireEvent.click(quote);

    expect(screen.getByLabelText("Alice 的消息，14:32")).toHaveClass(
      "isHighlighted",
    );
    expect(screen.getByText("已定位到 Alice 的原消息")).toBeInTheDocument();
  });

  it("keeps a non-interactive placeholder when the source is deleted", () => {
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const message = screen.getByLabelText("Alice 的消息，14:23");
    const column = message.querySelector(".chatBubbleColumn");
    fireEvent.pointerDown(column!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 120,
      clientY: 240,
      button: 0,
    });
    fireEvent.pointerMove(column!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 180,
      clientY: 242,
    });
    fireEvent.pointerUp(column!, {
      pointerId: 1,
      pointerType: "touch",
      clientX: 180,
      clientY: 242,
    });
    const input = screen.getByRole("textbox", { name: "消息内容" });
    fireEvent.change(input, { target: { value: "Reply before deletion" } });
    fireEvent.submit(screen.getByRole("form", { name: "发送私聊消息" }));

    fireEvent.contextMenu(screen.getByLabelText("Alice 的消息，14:23"));
    fireEvent.click(screen.getByRole("menuitem", { name: "删除" }));

    expect(
      screen.getByRole("button", { name: "This message has been deleted" }),
    ).toBeDisabled();
  });

  it("opens the message menu after a long press", () => {
    vi.useFakeTimers();
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const message = screen.getByLabelText("Alice 的消息，14:23");
    fireEvent.pointerDown(message, { pointerId: 1, pointerType: "touch" });
    act(() => vi.advanceTimersByTime(520));

    const menu = screen.getByRole("menu", { name: "消息操作" });
    expect(
      screen.getByLabelText("与 Andrew 私聊原型 · 375×812"),
    ).toHaveClass("hasMessageMenu");
    expect(
      screen.getByRole("button", { name: "关闭消息操作菜单" }),
    ).toHaveClass("prototypeMessageMenuDismiss");
    expect(screen.getByRole("menuitem", { name: "回复" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "复制" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Escape" });
    fireEvent.animationEnd(menu, { animationName: "prototypeMessageMenuOut" });
    expect(
      screen.queryByRole("menu", { name: "消息操作" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "关闭消息操作菜单" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("与 Andrew 私聊原型 · 375×812"),
    ).not.toHaveClass("hasMessageMenu");
    fireEvent.pointerUp(message, { pointerId: 1, pointerType: "touch" });
    vi.useRealTimers();
  });

  it("opens the message menu after a mouse long press with background blur", () => {
    vi.useFakeTimers();
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const message = screen.getByLabelText("Alice 的消息，14:23");
    fireEvent.pointerDown(message, {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
    });
    act(() => vi.advanceTimersByTime(520));

    expect(
      screen.getByLabelText("与 Andrew 私聊原型 · 375×812"),
    ).toHaveClass("hasMessageMenu");
    expect(screen.getByRole("menu", { name: "消息操作" })).toBeInTheDocument();
    fireEvent.pointerUp(message, {
      pointerId: 2,
      pointerType: "mouse",
      button: 0,
    });
    vi.useRealTimers();
  });

  it("starts a reply when a message bubble is swiped past the threshold", () => {
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const message = screen.getByLabelText("Alice 的消息，14:23");
    const column = message.querySelector(".chatBubbleColumn");
    expect(column).not.toBeNull();

    fireEvent.pointerDown(column!, {
      pointerId: 7,
      pointerType: "touch",
      clientX: 120,
      clientY: 240,
      button: 0,
    });
    fireEvent.pointerMove(column!, {
      pointerId: 7,
      pointerType: "touch",
      clientX: 180,
      clientY: 242,
    });
    fireEvent.pointerUp(column!, {
      pointerId: 7,
      pointerType: "touch",
      clientX: 180,
      clientY: 242,
    });

    expect(
      screen.getByRole("region", { name: "正在回复 Alice" }),
    ).toBeInTheDocument();
  });

  it("renders Figma reply-context variants for image and voice", () => {
    vi.useFakeTimers();
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const imageMessage = screen.getByLabelText("Alice 的消息，14:25");
    fireEvent.pointerDown(imageMessage, { pointerId: 1, pointerType: "touch" });
    act(() => vi.advanceTimersByTime(520));
    fireEvent.click(screen.getByRole("menuitem", { name: "回复" }));

    const imageContext = screen.getByRole("region", { name: "正在回复 Alice" });
    expect(imageContext).toHaveAttribute("data-kind", "image");
    expect(imageContext).toHaveTextContent("Photo");
    expect(imageContext.querySelector(".prototypeReplyContextThumb img")).toHaveAttribute(
      "src",
      expect.stringContaining("photo-square.png"),
    );
    expect(screen.getByRole("button", { name: "取消回复" }).querySelector("[data-system-icon=close]")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "取消回复" }));

    const voiceMessage = screen.getByLabelText("Alice 的消息，14:27");
    fireEvent.pointerDown(voiceMessage, { pointerId: 2, pointerType: "touch" });
    act(() => vi.advanceTimersByTime(520));
    fireEvent.click(screen.getByRole("menuitem", { name: "回复" }));

    const voiceContext = screen.getByRole("region", { name: "正在回复 Alice" });
    expect(voiceContext).toHaveAttribute("data-kind", "voice");
    expect(voiceContext).toHaveTextContent("18''");
    expect(voiceContext.querySelector("[data-system-icon=voice]")).toBeTruthy();
    vi.useRealTimers();
  });

  it("scrolls a bottom message into view before spring-lifting the menu", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const list = screen.getByRole("main", { name: "与 Andrew 的消息" });
    const message = screen.getByLabelText("You 的消息，14:37");
    Object.defineProperty(list, "scrollTop", { writable: true, value: 0 });
    Object.defineProperty(list, "scrollHeight", { value: 1800 });
    Object.defineProperty(list, "clientHeight", { value: 400 });

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function mockRect(this: HTMLElement) {
        if (this === list) {
          return {
            top: 100,
            bottom: 500,
            left: 0,
            right: 375,
            width: 375,
            height: 400,
            x: 0,
            y: 100,
            toJSON: () => ({}),
          };
        }
        if (this === message) {
          return {
            top: 620,
            bottom: 676,
            left: 100,
            right: 300,
            width: 200,
            height: 56,
            x: 100,
            y: 620,
            toJSON: () => ({}),
          };
        }
        if (
          this.getAttribute("role") === "menu" ||
          this.classList.contains("prototypeMessageMenu")
        ) {
          return {
            top: 680,
            bottom: 840,
            left: 100,
            right: 212,
            width: 112,
            height: 160,
            x: 100,
            y: 680,
            toJSON: () => ({}),
          };
        }
        return {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      },
    );

    fireEvent.pointerDown(message, { pointerId: 1, pointerType: "touch" });
    act(() => {
      vi.advanceTimersByTime(520);
    });

    expect(list.scrollTop).toBeGreaterThan(0);
    expect(screen.getByRole("menu", { name: "消息操作" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("spring-lifts a bottom message when the action menu would be clipped", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    const list = screen.getByRole("main", { name: "与 Andrew 的消息" });
    const message = screen.getByLabelText("Alice 的消息，14:27");
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function mockRect(this: HTMLElement) {
        if (this === list) {
          return {
            top: 100,
            bottom: 500,
            left: 0,
            right: 375,
            width: 375,
            height: 400,
            x: 0,
            y: 100,
            toJSON: () => ({}),
          };
        }
        if (this === message) {
          return {
            top: 420,
            bottom: 476,
            left: 100,
            right: 300,
            width: 200,
            height: 56,
            x: 100,
            y: 420,
            toJSON: () => ({}),
          };
        }
        if (
          this.getAttribute("role") === "menu" ||
          this.classList.contains("prototypeMessageMenu")
        ) {
          return {
            top: 480,
            bottom: 640,
            left: 100,
            right: 212,
            width: 112,
            height: 160,
            x: 100,
            y: 480,
            toJSON: () => ({}),
          };
        }
        return {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          width: 0,
          height: 0,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        };
      },
    );

    fireEvent.pointerDown(message, { pointerId: 1, pointerType: "touch" });
    act(() => {
      vi.advanceTimersByTime(520);
    });

    expect(screen.getByRole("menu", { name: "消息操作" })).toBeInTheDocument();
    expect(message).toHaveClass("isMenuOpen");

    act(() => {
      vi.runOnlyPendingTimers();
    });

    // overflow = 640 - (500 - 12) = 152
    expect(message.style.getPropertyValue("--private-chat-menu-lift")).toBe(
      "152px",
    );
    vi.useRealTimers();
  });

  it("opens the emoji panel and sends a custom sticker", () => {
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "选择表情" }));
    expect(screen.getByRole("region", { name: "表情面板" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Custom" }));
    fireEvent.click(screen.getByRole("button", { name: "Celebration" }));
    expect(document.querySelectorAll(".prototypeMessageSticker")).toHaveLength(2);
    expect(screen.getByText("消息已发送")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "选择表情" }));
    fireEvent.click(screen.getByRole("tab", { name: "Recent" }));
    expect(
      screen.getByRole("button", { name: "Celebration" }),
    ).toBeInTheDocument();
  });

  it("inserts unicode emoji into the draft from the emoji tab", () => {
    render(<PrivateChatPrototype friend={friend} onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "选择表情" }));
    fireEvent.click(screen.getByRole("tab", { name: "Emoji" }));
    fireEvent.click(screen.getByRole("button", { name: "👍" }));

    expect(screen.getByRole("textbox", { name: "消息内容" })).toHaveValue("👍");
    expect(screen.getByText("已插入 👍")).toBeInTheDocument();
  });
});
