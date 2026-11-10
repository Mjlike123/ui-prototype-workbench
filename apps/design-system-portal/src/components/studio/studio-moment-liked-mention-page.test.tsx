import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioMomentLikedMentionPage } from "./studio-moment-liked-mention-page";

describe("StudioMomentLikedMentionPage", () => {
  it("renders scene tabs and opens mention picker from compose scene", () => {
    render(<StudioMomentLikedMentionPage width={375} height={812} />);

    fireEvent.click(screen.getByRole("tab", { name: "发布 @" }));

    fireEvent.click(screen.getByRole("button", { name: "提及好友" }));

    expect(
      screen.getByRole("dialog", { name: "提及好友" }),
    ).toBeInTheDocument();
  });

  it("replaces typed @ with a selected friend while keeping the post text", async () => {
    render(
      <StudioMomentLikedMentionPage
        width={375}
        height={812}
        initialScene="compose-mention"
      />,
    );

    fireEvent.change(screen.getByLabelText("动态文案"), {
      target: { value: "一起看日落 @", selectionStart: 7, selectionEnd: 7 },
    });
    expect(screen.getByRole("dialog", { name: "提及好友" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Andrew/ }));
    fireEvent.click(screen.getByRole("button", { name: "完成" }));

    await waitFor(() =>
      expect(screen.getByLabelText("动态文案")).toHaveValue("一起看日落 @Andrew "),
    );
  });

  it("preserves the comment draft when a friend is mentioned", async () => {
    render(
      <StudioMomentLikedMentionPage
        width={375}
        height={812}
        initialScene="comment-mention"
      />,
    );

    fireEvent.click(screen.getByPlaceholderText(/reply to Latifa/i));
    const reply = screen.getByLabelText("回复内容");
    fireEvent.change(reply, {
      target: { value: "好漂亮 @", selectionStart: 5, selectionEnd: 5 },
    });
    expect(screen.getByRole("dialog", { name: "提及好友" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Mariam/ }));
    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    await waitFor(() =>
      expect(screen.getByLabelText("回复内容")).toHaveValue("好漂亮 @Mariam "),
    );
  });

  it("opens liked moments from the private entry on the Core Profile scene", () => {
    render(<StudioMomentLikedMentionPage />);
    fireEvent.click(screen.getByRole("tab", { name: "Profile 入口" }));

    fireEvent.click(
      screen.getByRole("button", {
        name: "我赞过的，2 条动态，仅你可见",
      }),
    );

    expect(
      screen.getByRole("navigation", { name: "我赞过的动态导航" }),
    ).toBeInTheDocument();
  });

  it("removes a liked moment with an undo path", () => {
    vi.useFakeTimers();
    try {
      render(
        <StudioMomentLikedMentionPage
          width={375}
          height={812}
          initialScene="liked-list"
        />,
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: "取消点赞 Latifa Alghanim 的动态",
        }),
      );
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.queryByText("Latifa Alghanim")).not.toBeInTheDocument();

      fireEvent.click(
        screen.getByRole("button", {
          name: "已从我赞过的移除，点此撤销",
        }),
      );
      expect(screen.getByText("Latifa Alghanim")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("opens the full moment detail from the compact history card", () => {
    render(
      <StudioMomentLikedMentionPage
        width={375}
        height={812}
        initialScene="liked-list"
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "查看 Latifa Alghanim 的动态详情",
      }),
    );

    expect(screen.getByLabelText("动态详情 · 375×812")).toBeInTheDocument();
  });

  it("uses a master-detail layout on the wide canvas", () => {
    render(
      <StudioMomentLikedMentionPage
        width={890}
        height={626}
        initialScene="liked-list"
      />,
    );

    expect(screen.getByLabelText("已选动态详情")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "已选动态详情导航" }),
    ).toBeInTheDocument();
  });

  it("keeps the clear-confirm dialog inside the notification device", () => {
    const { container } = render(
      <StudioMomentLikedMentionPage
        width={375}
        height={812}
        initialScene="notifications"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "清空" }));

    const device = container.querySelector(
      '[data-capture-scene="notifications"]',
    );
    const dialog = screen.getByRole("dialog", { name: "清空全部通知？" });
    const overlay = dialog.closest(".kitCenterDialogOverlay");

    expect(device).toContainElement(dialog);
    expect(overlay?.parentElement).toBe(device);
  });

  it("deletes one notification and clears the rest only after confirmation", () => {
    render(
      <StudioMomentLikedMentionPage
        width={375}
        height={812}
        initialScene="notifications"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Latifa 赞了你的动态的更多操作/ }));
    fireEvent.click(screen.getByRole("button", { name: /删除通知：Latifa 赞了你的动态/ }));
    expect(screen.queryByText("Latifa 赞了你的动态")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "清空" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(screen.getByText("Andrew 回复了你的评论")).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole("navigation", { name: "二级页面导航" })).getByRole(
        "button",
        { name: "清空" },
      ),
    );
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "清空全部通知？" })).getByRole(
        "button",
        { name: "清空" },
      ),
    );
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });
});
