import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AvatarVisual, type AvatarSize } from "./avatar-visual";

const businessSizes: AvatarSize[] = [72, 60, 48, 40, 36, 24, 20];

describe("AvatarVisual", () => {
  it("renders every business size at its declared dimensions", () => {
    const { container } = render(
      <>
        {businessSizes.map((size) => (
          <AvatarVisual size={size} key={size} />
        ))}
      </>,
    );

    const frames = container.querySelectorAll(".avatarVisualImage");
    expect(frames).toHaveLength(businessSizes.length);

    businessSizes.forEach((size, index) => {
      const frame = frames[index] as HTMLElement;
      expect(frame.style.width).toBe(`${size}px`);
      expect(frame.style.height).toBe(`${size}px`);
      expect(frame.querySelector("img")).toHaveAttribute("width", `${size}`);
    });
  });

  it("keeps the avatar centered when a decoration frame is present", () => {
    const { container } = render(<AvatarVisual size={48} framed />);

    const root = container.querySelector(".avatarVisual") as HTMLElement;
    const image = container.querySelector(".avatarVisualImage") as HTMLElement;

    expect(root).toHaveClass("avatarVisual--framed");
    expect(root.style.width).toBe("72px");
    expect(image.style.width).toBe("48px");
  });

  it("hides the decoration frame from assistive technology", () => {
    const { container } = render(<AvatarVisual size={48} framed />);

    const frame = container.querySelector(".avatarVisualFrame");
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame).toHaveAttribute("alt", "");
  });

  it("renders no decoration frame by default", () => {
    const { container } = render(<AvatarVisual size={48} />);

    expect(container.querySelector(".avatarVisualFrame")).toBeNull();
    expect(
      (container.querySelector(".avatarVisual") as HTMLElement).style.width,
    ).toBe("48px");
  });

  it("exposes the user identity only when the avatar carries it alone", () => {
    const { rerender } = render(<AvatarVisual size={48} alt="Nada" />);
    expect(screen.getByRole("img", { name: "Nada" })).toBeInTheDocument();

    rerender(<AvatarVisual size={48} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("renders light and dark default empty states", () => {
    const { container, rerender } = render(
      <AvatarVisual size={72} empty emptyTheme="light" />,
    );

    expect(container.querySelector(".avatarVisual--empty")).toBeTruthy();
    expect(container.querySelector(".avatarVisualImage--empty")).toBeTruthy();
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "default-empty-light.png",
    );

    rerender(<AvatarVisual size={48} empty emptyTheme="dark" />);
    expect(container.querySelector("img")?.getAttribute("src")).toContain(
      "default-empty-dark.png",
    );
    expect(container.querySelector("img")).toHaveAttribute("width", "48");
  });
});
