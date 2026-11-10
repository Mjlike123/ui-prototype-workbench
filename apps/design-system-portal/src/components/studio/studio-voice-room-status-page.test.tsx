import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudioVoiceRoomStatusPage } from "./studio-voice-room-status-page";

describe("StudioVoiceRoomStatusPage", () => {
  it("renders scene tabs and switches between studio scenes", () => {
    render(<StudioVoiceRoomStatusPage />);

    expect(
      screen.getByRole("tablist", { name: "在房状态原型场景" }),
    ).toBeInTheDocument();
    expect(screen.getByText("在语音房")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "隐私设置" }));
    expect(
      screen.getByRole("button", { name: "语音房在房状态" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "在房状态半窗" }));
    expect(
      screen.getByRole("listbox", { name: "可见范围" }),
    ).toBeInTheDocument();
  });
});
