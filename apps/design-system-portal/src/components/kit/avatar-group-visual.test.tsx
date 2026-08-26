import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  AvatarGroupVisual,
  type AvatarGroupVariant,
} from "./avatar-group-visual";

const variants: AvatarGroupVariant[] = [
  "list-2",
  "list-3",
  "list-4",
  "list-5",
  "home-more",
  "home-row",
];

describe("AvatarGroupVisual", () => {
  it("renders every group layout variant with the expected member count", () => {
    const { container } = render(
      <>
        {variants.map((variant) => (
          <AvatarGroupVisual variant={variant} key={variant} />
        ))}
      </>,
    );

    const groups = container.querySelectorAll(".avatarGroupVisual");
    expect(groups).toHaveLength(variants.length);

    expect(groups[0]?.querySelectorAll(".avatarVisualImage")).toHaveLength(2);
    expect(groups[1]?.querySelectorAll(".avatarVisualImage")).toHaveLength(3);
    expect(groups[2]?.querySelectorAll(".avatarVisualImage")).toHaveLength(4);
    expect(groups[3]?.querySelectorAll(".avatarVisualImage")).toHaveLength(5);
    expect(groups[4]?.querySelectorAll(".avatarVisualImage")).toHaveLength(4);
    expect(groups[5]?.querySelectorAll(".avatarVisualImage")).toHaveLength(6);
  });

  it("applies the variant modifier class and defers layout to CSS", () => {
    const { container } = render(<AvatarGroupVisual variant="home-more" />);

    expect(container.querySelector(".avatarGroupVisual--home-more")).toBeTruthy();
    expect(
      container.querySelector(".avatarVisualImage")?.getAttribute("style"),
    ).toBeNull();
  });

  it("hides decorative groups from assistive technology by default", () => {
    const { container } = render(<AvatarGroupVisual variant="list-4" />);

    expect(container.querySelector(".avatarGroupVisual")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
