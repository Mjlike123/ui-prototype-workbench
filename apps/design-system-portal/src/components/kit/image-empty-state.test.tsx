import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageEmptyState } from "./image-empty-state";

describe("ImageEmptyState", () => {
  it("renders light and dark themes with centered picture icons", () => {
    const { container, rerender } = render(<ImageEmptyState theme="light" />);

    expect(screen.getByRole("img", { name: "暂无图片" })).toHaveClass(
      "imageEmptyState--light",
    );
    expect(
      container.querySelector(".imageEmptyStateIcon")?.getAttribute("src"),
    ).toContain("picture-light.png");

    rerender(<ImageEmptyState theme="dark" aria-label="Image unavailable" />);
    expect(screen.getByRole("img", { name: "Image unavailable" })).toHaveClass(
      "imageEmptyState--dark",
    );
    expect(
      container.querySelector(".imageEmptyStateIcon")?.getAttribute("src"),
    ).toContain("picture-dark.png");
  });
});
