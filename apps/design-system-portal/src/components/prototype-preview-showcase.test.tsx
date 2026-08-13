import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrototypePreviewShowcase } from "./prototype-preview-showcase";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("PrototypePreviewShowcase", () => {
  it("integrates delivery details and keeps adjustments per page", () => {
    render(<PrototypePreviewShowcase />);

    expect(
      screen.getByRole("complementary", {
        name: "TopTop · 首页 交付说明与预览调整",
      }),
    ).toBeInTheDocument();
    const primaryPages = screen.getByRole("group", { name: "一级页面" });
    const secondaryPages = screen.getByRole("group", { name: "二级页面" });
    expect(
      within(primaryPages).queryByRole("button", { name: /个人资料/ }),
    ).toBeNull();
    expect(
      within(secondaryPages).getByRole("button", { name: /个人资料/ }),
    ).toBeInTheDocument();
    expect(
      within(secondaryPages).getByRole("button", { name: /Search · 全局搜索/ }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("预览设备"), {
      target: { value: "iphone-large" },
    });
    let frame = screen.getByLabelText("TopTop · 首页 light 可交互原型");
    expect(frame).toHaveStyle({ width: "393px", height: "852px" });
    expect(
      screen.getByLabelText("TopTop 首页原型 · 393×852"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("预览设备"), {
      target: { value: "iphone-16-plus" },
    });
    frame = screen.getByLabelText("TopTop · 首页 light 可交互原型");
    expect(frame).toHaveStyle({ width: "430px", height: "932px" });
    expect(
      screen.getByLabelText("TopTop 首页原型 · 430×932"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Room · 发现/ }));
    frame = screen.getByLabelText("Room · 发现 light 可交互原型");
    expect(frame).toHaveStyle({ width: "375px" });

    fireEvent.click(screen.getByRole("button", { name: /TopTop · 首页/ }));
    expect(
      screen.getByLabelText("TopTop · 首页 light 可交互原型"),
    ).toHaveStyle({ width: "430px" });

    fireEvent.click(screen.getByRole("button", { name: "重置" }));
    expect(
      screen.getByLabelText("TopTop · 首页 light 可交互原型"),
    ).toHaveStyle({ width: "375px" });
  });

  it("opens Search from Message and returns with Cancel", () => {
    vi.useFakeTimers();
    const { container } = render(<PrototypePreviewShowcase />);

    fireEvent.click(screen.getByRole("button", { name: /Message · 消息/ }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "打开搜索：Search by Name / Userid",
      }),
    );
    expect(
      screen.getByLabelText("Search · 全局搜索 light 可交互原型"),
    ).toBeInTheDocument();
    expect(container.querySelector(".prototypeNavStack--push")).not.toBeNull();
    expect(screen.getByRole("searchbox")).not.toHaveFocus();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(container.querySelector(".prototypeNavStack--push")).toBeNull();
    expect(screen.getByRole("searchbox")).toHaveFocus();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(
      screen.getByLabelText("Message · 消息 light 可交互原型"),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("opens a private chat from an online friend and returns to Message", () => {
    render(<PrototypePreviewShowcase />);

    fireEvent.click(screen.getByRole("button", { name: /Message · 消息/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Buioi" })[0]);
    expect(
      screen.getByLabelText("Private Chat · 私聊 light 可交互原型"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Buioi" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回 Message" }));
    expect(
      screen.getByLabelText("Message · 消息 light 可交互原型"),
    ).toBeInTheDocument();
  });

  it("applies dark theme globally without leaving the current page", () => {
    const { container } = render(<PrototypePreviewShowcase />);

    fireEvent.click(screen.getByRole("button", { name: /Message · 消息/ }));
    fireEvent.click(screen.getAllByRole("button", { name: "Buioi" })[0]);
    expect(
      screen.getByLabelText("Private Chat · 私聊 light 可交互原型"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Buioi" })).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole("group", { name: "预览主题" })).getByRole(
        "button",
        { name: "Dark" },
      ),
    );

    expect(
      screen.getByLabelText("Private Chat · 私聊 dark 可交互原型"),
    ).toHaveClass("prototypeRuntimePage--dark");
    expect(screen.getByRole("heading", { name: "Buioi" })).toBeInTheDocument();
    expect(
      screen.queryByLabelText("TopTop · 首页 dark 可交互原型"),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回 Message" }));
    const messageFrame = screen.getByLabelText("Message · 消息 dark 可交互原型");
    expect(messageFrame).toHaveClass("prototypeRuntimePage--dark");
    expect(
      container.querySelector(".prototypeDestinationStatus"),
    ).toHaveClass("iosStatusBar--light-content");

    fireEvent.click(screen.getByRole("button", { name: /Room · 发现/ }));
    expect(
      screen.getByLabelText("Room · 发现 dark 可交互原型"),
    ).toHaveClass("prototypeRuntimePage--dark");
  });

  it("opens Me support secondary pages and returns to Me", () => {
    render(<PrototypePreviewShowcase />);

    fireEvent.click(screen.getByRole("button", { name: /Me · 账户中心/ }));
    fireEvent.click(
      screen.getByRole("button", { name: "Community Guidelines" }),
    );
    expect(
      screen.getByLabelText(
        "Community Guidelines light 可交互原型",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Community Guidelines" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(
      screen.getByLabelText("Me · 账户中心 light 可交互原型"),
    ).toBeInTheDocument();
  });
});
