import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioTopicDiscoveryPage } from "./studio-topic-discovery-page";

describe("StudioTopicDiscoveryPage", () => {
  it("renders Mine recommended feed with Kit navigation and feed cards", () => {
    render(<StudioTopicDiscoveryPage onBack={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Mine" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "推荐" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByLabelText("打开话题搜索")).toBeInTheDocument();
    expect(screen.getByText("Latifa")).toBeInTheDocument();
    expect(screen.getAllByText("#OOTD").length).toBeGreaterThan(0);
  });

  it("moves from search discover to suggestions and topic detail", () => {
    render(<StudioTopicDiscoveryPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("打开话题搜索"));
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "热门搜索" })).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "OO" },
    });
    expect(
      screen.getByRole("button", { name: "搜索 #OOTD" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "搜索 #OOTD" }));
    expect(screen.getByRole("heading", { name: "# OOTD" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "参与话题" })).toBeInTheDocument();
  });

  it("shows post menu and unfollow confirmation on topic detail", () => {
    render(<StudioTopicDiscoveryPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "帖子操作" }));
    expect(screen.getByRole("menu", { name: "帖子操作" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "置顶" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "取消关注" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("是否取消关注话题？");
  });

  it("renders empty followed topics state with suggestions", () => {
    render(<StudioTopicDiscoveryPage onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("tab", { name: "无关注话题" }));
    expect(screen.getByText("暂无关注话题")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "关注 #OOTD" }),
    ).toBeInTheDocument();
  });
});
