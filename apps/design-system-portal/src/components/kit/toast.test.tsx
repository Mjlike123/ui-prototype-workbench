import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toast } from "./toast";

describe("Toast", () => {
  it("renders text-only short toast with chevron action", () => {
    const onPress = vi.fn();

    render(
      <Toast
        message="我是一条提示"
        showChevron
        onPress={onPress}
      />,
    );

    expect(
      screen.getByRole("button", { name: "我是一条提示" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "我是一条提示" }));
    expect(onPress).toHaveBeenCalled();
  });

  it("renders long text toast", () => {
    render(
      <Toast
        message="我是一条提示最多显示是四个字"
        longText
      />,
    );

    expect(screen.getByRole("status", { name: "我是一条提示最多显示是四个字" }))
      .toHaveClass("kitToast--long");
  });

  it("renders success status toast", () => {
    render(
      <Toast
        message="成功提示"
        status="success"
      />,
    );

    expect(screen.getByText("成功提示")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveClass("kitToast--status");
  });

  it("renders loading status toast", () => {
    render(
      <Toast
        message="加载中"
        status="loading"
        longText
      />,
    );

    expect(screen.getByText("加载中")).toBeInTheDocument();
    expect(document.querySelector(".kitToastStatusIcon--loading")).toBeTruthy();
  });
});
