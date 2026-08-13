import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ListTag, MEMBERSHIP_LEVELS } from "./list-tag";

describe("ListTag", () => {
  it("renders gender tags with accessible names", () => {
    const { container } = render(
      <>
        <ListTag kind="gender" gender="female" age={28} />
        <ListTag kind="gender" gender="male" />
      </>,
    );

    expect(screen.getByLabelText("女性，28 岁")).toBeInTheDocument();
    expect(screen.getByLabelText("男性")).toBeInTheDocument();
    container.querySelectorAll(".listTagGenderIcon img").forEach((icon) => {
      expect(icon).toHaveAttribute("width", "8");
      expect(icon).toHaveAttribute("height", "8");
      expect(icon.parentElement).toHaveClass("listTagGenderIcon");
    });
  });

  it("maps every membership level to its formal asset", () => {
    const { container } = render(
      <>
        {MEMBERSHIP_LEVELS.map((level) => (
          <ListTag kind="membership" level={level} key={level} />
        ))}
      </>,
    );

    expect(container.querySelectorAll(".listTag--membership")).toHaveLength(19);
    expect(screen.getByLabelText("会员 V99")).toBeInTheDocument();
    expect(
      container.querySelector('img[src*="membership-v99.png"]'),
    ).not.toBeNull();
  });
});
