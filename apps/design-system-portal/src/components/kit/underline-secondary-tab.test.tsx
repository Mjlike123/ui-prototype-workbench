import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UnderlineSecondaryTab } from "./underline-secondary-tab";

const items = [
  { key: "about", label: "About me" },
  { key: "movement", label: "Movement(6)" },
] as const;

describe("UnderlineSecondaryTab", () => {
  it("supports selection and arrow-key navigation", () => {
    const onChange = vi.fn();
    render(
      <UnderlineSecondaryTab
        items={items}
        value="about"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("tab", { name: "About me" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Movement(6)" }));
    expect(onChange).toHaveBeenCalledWith("movement");
    fireEvent.keyDown(screen.getByRole("tab", { name: "About me" }), {
      key: "ArrowRight",
    });
    expect(onChange).toHaveBeenCalledWith("movement");
  });
});
