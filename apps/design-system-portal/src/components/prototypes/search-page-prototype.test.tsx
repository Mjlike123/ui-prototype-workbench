import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchPagePrototype } from "./search-page-prototype";

describe("SearchPagePrototype", () => {
  it("filters results and returns to TopTop with Cancel", () => {
    const onBack = vi.fn();
    render(<SearchPagePrototype onBack={onBack} />);

    expect(
      screen.getByRole("heading", { name: "Recent searches" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cassie 的个人资料/ }))
      .toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Jackaroo" },
    });
    expect(screen.getByRole("button", { name: "打开 Jackaroo" }))
      .toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Cassie 的个人资料/ }))
      .toBeNull();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "nothing here" },
    });
    expect(screen.getByText("No results found")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
