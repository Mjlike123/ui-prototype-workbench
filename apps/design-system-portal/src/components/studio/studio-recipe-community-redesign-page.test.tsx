import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioRecipeCommunityRedesignPage } from "./studio-recipe-community-redesign-page";

describe("StudioRecipeCommunityRedesignPage", () => {
  it("renders Filmsim reference with search, Pro banner and recipe grid", () => {
    render(
      <StudioRecipeCommunityRedesignPage
        onBack={vi.fn()}
        initialScene="filmsim"
      />,
    );

    expect(screen.getByRole("tab", { name: "D · Filmsim 竞品参考" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("heading", { name: "FILMSIMRECIPES." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "查看 Pro 配方" })).toBeInTheDocument();
    expect(screen.getByText("153 个配方")).toBeInTheDocument();
    expect(screen.getByLabelText("12.8k 次导入")).toBeInTheDocument();
  });

  it("defaults to the selected quality direction and completes the write flow", () => {
    vi.useFakeTimers();
    render(<StudioRecipeCommunityRedesignPage />);

    expect(
      screen.getByRole("tab", { name: "精选方向 · 暗房工作台" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "窗边暖调" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "写入相机" })[0]);
    expect(
      screen.getByRole("heading", { name: "选择机身槽位" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "C1，空闲 · 推荐" }),
    );
    expect(screen.getByRole("heading", { name: "正在写入 C1" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1200));
    expect(
      screen.getByRole("heading", { name: "窗边暖调 已写入 C1" }),
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("keeps save state and exposes a two-pane detail on Duo inner canvas", () => {
    const { container } = render(
      <StudioRecipeCommunityRedesignPage width={890} height={626} />,
    );

    const save = screen.getAllByRole("button", { name: "收藏 窗边暖调" })[0];
    fireEvent.click(save);
    expect(
      screen.getAllByRole("button", { name: "取消收藏 窗边暖调" })[0],
    ).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector(".studioRecipeQualityExperience--inner")).toBeTruthy();
    expect(screen.getByLabelText("窗边暖调 详情")).toBeInTheDocument();
  });

  it("renders FujiStyle variant with community navigation and save CTA", () => {
    render(
      <StudioRecipeCommunityRedesignPage
        onBack={vi.fn()}
        initialScene="fujistyle"
      />,
    );

    expect(screen.getByRole("tab", { name: "A · FujiStyle 灵感流" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "配方社区" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "存配方" })).toBeInTheDocument();
    expect(screen.getByText("热门配方组")).toBeInTheDocument();
  });

  it("shows module comparison table scene", () => {
    render(<StudioRecipeCommunityRedesignPage />);

    fireEvent.click(screen.getByRole("tab", { name: "模块对照表" }));
    expect(
      screen.getByRole("heading", { name: "首页模块对照表" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "主 CTA" })).toBeInTheDocument();
  });

  it("renders Fuji Recipes workbench with write-to-camera CTA", () => {
    render(<StudioRecipeCommunityRedesignPage />);

    fireEvent.click(screen.getByRole("tab", { name: "B · Fuji Recipes 工作台" }));
    expect(screen.getByText("X100VI · 已连接")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "写入" }).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("我的相机槽位")).toBeInTheDocument();
  });

  it("renders Recipe Room dual track with apply recipe CTA", () => {
    render(<StudioRecipeCommunityRedesignPage />);

    fireEvent.click(screen.getByRole("tab", { name: "C · Recipe Room 双轨" }));
    expect(screen.getByRole("tab", { name: "配方 Recipe" })).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "应用配方" }).length,
    ).toBeGreaterThan(0);
  });
});
