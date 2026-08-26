import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TextSecondaryTab } from "./text-secondary-tab";

const items = [
  { key: "comments", label: "Comments" },
  { key: "like", label: "like" },
] as const;

describe("TextSecondaryTab", () => {
  it("supports selection and arrow-key navigation", () => {
    const onChange = vi.fn();
    render(
      <TextSecondaryTab items={items} value="comments" onChange={onChange} />,
    );

    expect(screen.getByRole("tab", { name: "Comments" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("tab", { name: "like" }));
    expect(onChange).toHaveBeenCalledWith("like");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Comments" }), {
      key: "ArrowRight",
    });
    expect(onChange).toHaveBeenCalledWith("like");
  });
});
