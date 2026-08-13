import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "./breadcrumb";

describe("Breadcrumb", () => {
  it("renders linked and current segments with a separator", () => {
    render(
      <Breadcrumb
        items={[
          { label: "交互与模式", href: "/interactions" },
          { label: "bottom-navigation-selection" },
        ]}
      />,
    );

    const navigation = screen.getByRole("navigation", { name: "面包屑" });
    expect(navigation).toContainElement(
      screen.getByRole("link", { name: "交互与模式" }),
    );
    expect(navigation).toContainElement(
      screen.getByText("bottom-navigation-selection"),
    );
    expect(screen.getByText("/")).toHaveClass("breadcrumbSeparator");
    expect(screen.getByRole("link", { name: "交互与模式" })).toHaveAttribute(
      "href",
      "/interactions",
    );
    expect(
      screen.getByText("bottom-navigation-selection"),
    ).toHaveAttribute("aria-current", "page");
  });
});
