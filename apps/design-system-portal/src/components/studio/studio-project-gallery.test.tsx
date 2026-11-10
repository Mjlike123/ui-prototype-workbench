import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { STUDIO_PROJECTS } from "@/lib/studio-project-catalog";
import { StudioProjectGallery } from "./studio-project-gallery";

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe("StudioProjectGallery", () => {
  it("renders project cards and links to project detail pages", () => {
    render(<StudioProjectGallery initialProjects={STUDIO_PROJECTS.slice(0, 2)} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: "打开项目：Moment 发布与动态详情" }),
    ).toHaveAttribute("href", "/canvas/studio/moment-publish-detail");
  });

  it("requires confirmation and removes only the selected project", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    window.sessionStorage.setItem(
      "toptop-studio-feed-compose-draft-v1",
      "draft",
    );

    render(<StudioProjectGallery initialProjects={STUDIO_PROJECTS.slice(3, 5)} />);
    fireEvent.click(
      screen.getByRole("button", { name: "删除项目：发布动态探索" }),
    );

    expect(screen.getByRole("dialog")).toHaveTextContent(
      "Kit、Core 与共享组件不会被删除",
    );
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/studio-projects/feed-compose",
        { method: "DELETE" },
      ),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("link", { name: "打开项目：发布动态探索" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      window.sessionStorage.getItem("toptop-studio-feed-compose-draft-v1"),
    ).toBeNull();
    expect(
      screen.getByRole("link", { name: "打开项目：IM 自定义表情" }),
    ).toBeInTheDocument();
  });

  it("keeps the project when confirmation is cancelled", () => {
    render(<StudioProjectGallery initialProjects={STUDIO_PROJECTS.slice(0, 1)} />);
    fireEvent.click(
      screen.getByRole("button", { name: "删除项目：Moment 发布与动态详情" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(
      screen.getByRole("link", { name: "打开项目：Moment 发布与动态详情" }),
    ).toBeInTheDocument();
  });

  it("keeps the project and reports an API failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "项目仍被引用，无法删除。" }),
      }),
    );
    render(<StudioProjectGallery initialProjects={STUDIO_PROJECTS.slice(0, 1)} />);

    fireEvent.click(
      screen.getByRole("button", { name: "删除项目：Moment 发布与动态详情" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

    expect(
      await screen.findByText("项目仍被引用，无法删除。"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "打开项目：Moment 发布与动态详情" }),
    ).toBeInTheDocument();
  });
});
