import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchControl } from "./search-control";

describe("SearchControl", () => {
  it("supports input, clear, submit and cancel", () => {
    const onChange = vi.fn();
    const onCancel = vi.fn();
    const onSubmit = vi.fn();
    const { rerender } = render(
      <SearchControl
        value=""
        active
        onActivate={vi.fn()}
        onChange={onChange}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "Cassie" },
    });
    expect(onChange).toHaveBeenCalledWith("Cassie");

    rerender(
      <SearchControl
        value="Cassie"
        active
        onActivate={vi.fn()}
        onChange={onChange}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "清除搜索内容" }));
    expect(onChange).toHaveBeenCalledWith("");

    fireEvent.submit(screen.getByRole("search"));
    expect(onSubmit).toHaveBeenCalledWith("Cassie");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("defers focus until autoFocus is enabled", () => {
    const props = {
      value: "",
      active: true,
      onActivate: vi.fn(),
      onChange: vi.fn(),
      onCancel: vi.fn(),
    };
    const { rerender } = render(
      <SearchControl {...props} autoFocus={false} />,
    );
    const input = screen.getByRole("searchbox");

    expect(input).not.toHaveFocus();
    rerender(<SearchControl {...props} autoFocus />);
    expect(input).toHaveFocus();
  });

  it("renders inside the dark runtime shell", () => {
    render(
      <div className="prototypeRuntimePage--dark">
        <SearchControl
          value="Cassie"
          active
          onActivate={vi.fn()}
          onChange={vi.fn()}
          onCancel={vi.fn()}
        />
      </div>,
    );

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveValue("Cassie");
  });
});
