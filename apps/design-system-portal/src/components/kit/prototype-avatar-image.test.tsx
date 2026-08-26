import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PrototypeAvatarImage } from "./prototype-avatar-image";

describe("PrototypeAvatarImage", () => {
  it("wraps prototype avatars in the Kit image ring", () => {
    const { container } = render(
      <PrototypeAvatarImage
        src="/prototypes/toptop-home/avatar-cassie.png"
        alt=""
        displaySize={48}
      />,
    );

    const ring = container.querySelector(".avatarVisualImage");
    expect(ring).toBeTruthy();
    expect((ring as HTMLElement).style.width).toBe("48px");
    expect(ring?.querySelector("img")).toHaveAttribute(
      "width",
      "144",
    );
  });
});
