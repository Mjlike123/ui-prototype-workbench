import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StudioAppLoginFlowPage } from "./studio-app-login-flow-page";

describe("StudioAppLoginFlowPage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("completes the phone and OTP login flow", () => {
    vi.useFakeTimers();
    render(<StudioAppLoginFlowPage />);

    fireEvent.click(screen.getByRole("button", { name: /手机号/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "手机号" }), {
      target: { value: "13800138000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "获取验证码" }));

    act(() => vi.advanceTimersByTime(650));
    expect(
      screen.getByRole("heading", { name: "输入验证码" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "六位验证码" }), {
      target: { value: "123456" },
    });
    act(() => vi.advanceTimersByTime(700));

    expect(
      screen.getByRole("heading", { name: "登录成功" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "进入 TopTop" }));
    expect(screen.getByRole("status")).toHaveTextContent("主任务完成");
  });

  it("keeps OTP errors recoverable", () => {
    vi.useFakeTimers();
    render(<StudioAppLoginFlowPage />);

    fireEvent.click(screen.getByRole("tab", { name: "验证码错误" }));
    const input = screen.getByRole("textbox", { name: "六位验证码" });
    fireEvent.change(input, { target: { value: "000000" } });
    act(() => vi.advanceTimersByTime(700));

    expect(screen.getByText("验证码不正确，请重新输入")).toBeVisible();
    expect(input).toHaveValue("");
    expect(
      screen.getByRole("button", { name: "重新发送验证码" }),
    ).toBeEnabled();
  });

  it("supports the TopTop ID login path and inline errors", () => {
    vi.useFakeTimers();
    render(<StudioAppLoginFlowPage />);

    fireEvent.click(screen.getByRole("button", { name: /TopTop ID/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "TopTop ID" }), {
      target: { value: "wrong" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "654321" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));
    act(() => vi.advanceTimersByTime(700));
    expect(screen.getByText("TopTop ID 或密码不正确")).toBeVisible();

    fireEvent.change(screen.getByRole("textbox", { name: "TopTop ID" }), {
      target: { value: "toptop" },
    });
    fireEvent.change(screen.getByLabelText("密码"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "登录" }));
    act(() => vi.advanceTimersByTime(700));

    expect(screen.getByText("已通过 TopTop ID 完成身份验证。")).toBeVisible();
  });

  it("supports the last-used Apple login path", () => {
    vi.useFakeTimers();
    render(<StudioAppLoginFlowPage />);

    fireEvent.click(
      screen.getByRole("button", { name: "使用 Apple 继续" }),
    );
    expect(screen.getByText("正在连接 Apple…")).toBeVisible();
    act(() => vi.advanceTimersByTime(900));

    expect(screen.getByText("已通过 Apple 完成身份验证。")).toBeVisible();
  });
});
