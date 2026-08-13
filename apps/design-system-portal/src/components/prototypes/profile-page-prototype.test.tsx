import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ProfilePagePrototype } from "./profile-page-prototype";

vi.mock("@/components/kit/pag-icon", () => ({
  PagIcon: ({
    src,
    fallback,
  }: {
    src: string;
    fallback?: ReactNode;
  }) => (
    <span data-pag-asset={src}>
      {fallback}
    </span>
  ),
}));

describe("ProfilePagePrototype", () => {
  it("renders the Figma profile and keeps navigation context while scrolling", () => {
    const onBack = vi.fn();
    const { container } = render(
      <ProfilePagePrototype onBack={onBack} />,
    );

    expect(screen.getByRole("heading", { name: "Andrew" })).toBeInTheDocument();
    expect(screen.getByText("Relationship")).toBeInTheDocument();
    expect(container.querySelector(".profileV3StickyTabs")).toBeInTheDocument();

    const scroll = container.querySelector(".profileV3Scroll");
    expect(scroll).not.toBeNull();
    fireEvent.scroll(scroll!, { target: { scrollTop: 240 } });
    expect(container.querySelector(".profileV3Navigation")).toHaveClass(
      "isSolid",
    );
    expect(screen.getByText("Amanda")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Movement(6)" }));
    expect(screen.getAllByText("Andrew")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "发布动态" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("uses one room-entry state and opens the active voice room", () => {
    const onNavigate = vi.fn();
    render(<ProfilePagePrototype onNavigate={onNavigate} />);

    const roomEntry = screen.getByRole("button", {
      name: "Enter Andrew's Music Party voice room",
    });
    expect(roomEntry).toHaveTextContent("In room voice");
    expect(roomEntry).toHaveTextContent("Join room");
    expect(roomEntry).not.toHaveAttribute("aria-pressed");
    expect(roomEntry).not.toHaveAttribute("data-state");
    expect(
      roomEntry.querySelector(
        '[data-pag-asset="/icons/animated/profile-mini-card-room.pag"]',
      ),
    ).toBeInTheDocument();

    fireEvent.click(roomEntry);
    expect(onNavigate).toHaveBeenCalledWith("room");
    expect(roomEntry).toHaveTextContent("Join room");
  });
});
