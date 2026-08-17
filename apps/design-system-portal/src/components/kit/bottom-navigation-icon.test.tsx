import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BottomNavigationIcon } from "./bottom-navigation-icon";

describe("BottomNavigationIcon", () => {
  it("renders inline SVG vectors instead of raster image placeholders", () => {
    const { container } = render(
      <BottomNavigationIcon name="message" selected />,
    );
    const icon = container.querySelector('[data-bottom-nav-icon="message"]');

    expect(icon).toHaveClass("bottomNavigationGlyph");
    expect(icon?.querySelector("svg")).toBeTruthy();
    expect(icon?.querySelector("img")).toBeNull();
    expect(icon).toHaveAttribute(
      "data-bottom-nav-asset",
      "/icons/bottom-navigation/message-filled.svg",
    );
  });

  it("uses outline vectors when unselected", () => {
    const { container } = render(<BottomNavigationIcon name="feed" />);
    expect(container.querySelector('[data-bottom-nav-icon="feed"] svg')).toBeTruthy();
    expect(container.querySelector("img")).toBeNull();
  });
});
