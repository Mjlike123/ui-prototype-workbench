import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InRoomNotification } from "./in-room-notification";

describe("InRoomNotification", () => {
  it("renders stacked layout with button action", () => {
    const onAction = vi.fn();

    render(
      <InRoomNotification
        tone="light"
        layout="stacked"
        action="button"
        title="进房提醒"
        description="好友已进入房间"
        actionLabel="加入"
        onAction={onAction}
      />,
    );

    expect(screen.getByRole("region", { name: "进房提醒，好友已进入房间" }))
      .toBeInTheDocument();
    expect(screen.getByText("进房提醒")).toBeInTheDocument();
    const action = screen.getByRole("button", { name: "加入" });
    expect(action).toHaveClass(
      "kitButton",
      "kitButton--height32",
      "kitButton--primary",
    );
    fireEvent.click(action);
    expect(onAction).toHaveBeenCalled();
  });

  it("renders compact dark layout with link action", () => {
    render(
      <InRoomNotification
        tone="dark"
        layout="compact"
        action="link"
        description="我是一段描述文本我是一段描述文本"
        actionLabel="查看"
        showAvatar={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: "查看" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("我是标题")).not.toBeInTheDocument();
  });

  it("renders without trailing action", () => {
    render(
      <InRoomNotification
        layout="stacked"
        action="none"
        title="系统通知"
        description="礼物已送达"
      />,
    );

    expect(screen.getByText("系统通知")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
