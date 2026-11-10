import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioSearchFlowPage } from "./studio-search-flow-page";

describe("StudioSearchFlowPage", () => {
  it("reuses the Core search page before the user types", () => {
    render(<StudioSearchFlowPage onBack={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "Recent searches" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("TopTop 搜索")).toBeInTheDocument();
  });

  it("moves from typeahead suggestions to categorized results", () => {
    render(<StudioSearchFlowPage onBack={vi.fn()} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "summer" },
    });
    expect(
      screen.getByRole("heading", { name: "Suggestions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "搜索 summer rooms" }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "搜索 summer rooms" }),
    );

    expect(
      screen.getByRole("tablist", { name: "搜索结果分类" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "summer rooms" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Related searches" }),
    ).toBeInTheDocument();
  });

  it("switches result types without replacing the search query", () => {
    render(<StudioSearchFlowPage onBack={vi.fn()} />);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "party" },
    });
    fireEvent.submit(screen.getByRole("search", { name: "TopTop 全局搜索" }));

    fireEvent.click(screen.getByRole("tab", { name: "Rooms" }));
    expect(
      screen.getByRole("heading", { name: "Rooms" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("party");

    fireEvent.click(screen.getByRole("tab", { name: "Games" }));
    expect(
      screen.getByRole("heading", { name: "Games" }),
    ).toBeInTheDocument();
  });
});
