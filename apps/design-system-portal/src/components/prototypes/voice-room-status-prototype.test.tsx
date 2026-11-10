import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VoiceRoomStatusPrototype } from "./voice-room-status-prototype";

describe("VoiceRoomStatusPrototype", () => {
  it("shows in-room follow chip on profile guest and enters room", () => {
    render(<VoiceRoomStatusPrototype scene="profile-guest" />);

    expect(
      screen.getByRole("button", { name: /进入 Intisar 的语音房/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("在语音房")).toBeInTheDocument();
    expect(screen.getByText("进入房间")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /进入 Intisar 的语音房/ }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("正在进入语音房…");
  });

  it("shows in-room avatar ring on feed and enters room from badge", () => {
    render(<VoiceRoomStatusPrototype scene="feed" />);

    expect(screen.getByText("In room voice")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: /Kann 正在语音房，点击进入房间/ }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("正在进入语音房…");
  });

  it("opens iOS text sheet and applies visibility selection", () => {
    render(<VoiceRoomStatusPrototype scene="privacy" onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "语音房在房状态" }));
    expect(
      screen.getByRole("listbox", { name: "可见范围" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("option", { name: /仅好友可见/ }));
    expect(screen.getByRole("status")).toHaveTextContent("已设为仅好友可见");
    expect(
      screen.queryByRole("listbox", { name: "可见范围" }),
    ).not.toBeInTheDocument();
  });

  it("blocks visibility settings when invisible in room is enabled", () => {
    render(<VoiceRoomStatusPrototype scene="privacy" onBack={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("switch", { name: /Invisible in Room/ }),
    );
    fireEvent.click(screen.getByRole("button", { name: "语音房在房状态" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "隐身时已对他人不可见在房状态",
    );
    expect(
      screen.queryByRole("listbox", { name: "可见范围" }),
    ).not.toBeInTheDocument();
  });

  it("renders privacy sheet scene with sheet open", () => {
    render(<VoiceRoomStatusPrototype scene="privacy-sheet" onBack={vi.fn()} />);

    expect(
      screen.getByRole("listbox", { name: "可见范围" }),
    ).toBeInTheDocument();
    expect(screen.getByText("所有人可见")).toBeInTheDocument();
  });
});
